import { pipeline, env } from '@huggingface/transformers';

// Configure transformers environment
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;
let currentModelId = null;
let currentDevice = null;
let currentDtypeKey = null;
let currentThreads = null;
let isCancelled = false;

// Track downloaded file sizes for composite progress percentage
const fileProgressMap = new Map();

function resetProgressMap() {
  fileProgressMap.clear();
}

function handleProgress(progress) {
  if (progress.status === 'progress' && progress.file) {
    fileProgressMap.set(progress.file, {
      loaded: progress.loaded || 0,
      total: progress.total || 0,
    });

    let totalLoaded = 0;
    let totalSize = 0;
    for (const item of fileProgressMap.values()) {
      totalLoaded += item.loaded;
      totalSize += item.total;
    }

    const percent = totalSize > 0 ? (totalLoaded / totalSize) * 100 : (progress.progress || 0);

    self.postMessage({
      type: 'MODEL_PROGRESS',
      file: progress.file,
      percent: Math.min(100, Math.round(percent * 10) / 10),
      loaded: totalLoaded,
      total: totalSize,
    });
  } else if (progress.status === 'initiate') {
    self.postMessage({
      type: 'MODEL_STATUS',
      status: `Инициализация загрузки: ${progress.file || ''}...`,
    });
  } else if (progress.status === 'done') {
    self.postMessage({
      type: 'MODEL_STATUS',
      status: `Файл загружен: ${progress.file || ''}`,
    });
  }
}

async function loadPipeline(modelId, device, dtype, threads = 0) {
  const dtypeKey = JSON.stringify(dtype);
  if (
    transcriber &&
    currentModelId === modelId &&
    currentDevice === device &&
    currentDtypeKey === dtypeKey &&
    currentThreads === threads
  ) {
    return transcriber;
  }

  if (transcriber) {
    self.postMessage({ type: 'STATUS', message: 'Освобождение памяти предыдущей модели...' });
    try {
      if (typeof transcriber.dispose === 'function') {
        await transcriber.dispose();
      }
    } catch (e) {
      console.warn('Dispose error:', e);
    }
    transcriber = null;
  }

  // Set number of WASM threads if specified
  if (env.backends?.onnx?.wasm) {
    if (threads && threads > 0) {
      env.backends.onnx.wasm.numThreads = threads;
    } else {
      const detectedCores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
      env.backends.onnx.wasm.numThreads = detectedCores;
    }
  }

  resetProgressMap();
  const threadInfo = threads > 0 ? ` [Потоков: ${threads}]` : '';
  self.postMessage({
    type: 'MODEL_STATUS',
    status: `Загрузка Whisper (${modelId.split('/').pop()}) [${device.toUpperCase()}]${threadInfo}...`,
  });

  const pipelineOptions = {
    device,
    progress_callback: handleProgress,
  };
  if (dtype) {
    pipelineOptions.dtype = dtype;
  }

  transcriber = await pipeline('automatic-speech-recognition', modelId, pipelineOptions);
  currentModelId = modelId;
  currentDevice = device;
  currentDtypeKey = dtypeKey;
  currentThreads = threads;

  self.postMessage({
    type: 'MODEL_READY',
    modelId,
    device,
    threads,
  });

  return transcriber;
}

/**
 * Searches for a natural silence break near target split time (25s - 30s)
 */
function findBestSplitSample(audioData, minSample, maxSample, windowSize = 1600) {
  if (maxSample >= audioData.length) return audioData.length;

  let minEnergy = Infinity;
  let bestSample = maxSample;

  // Step through in 100ms intervals (1600 samples at 16kHz)
  for (let s = minSample; s < maxSample; s += windowSize) {
    let energy = 0;
    const end = Math.min(audioData.length, s + windowSize);
    for (let j = s; j < end; j += 8) {
      energy += audioData[j] * audioData[j];
    }
    if (energy < minEnergy) {
      minEnergy = energy;
      bestSample = s + Math.floor(windowSize / 2);
    }
  }

  return bestSample;
}

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  if (type === 'CANCEL') {
    isCancelled = true;
    self.postMessage({ type: 'CANCELLED' });
    return;
  }

  if (type === 'PRELOAD_MODEL') {
    try {
      const { modelId, device, dtype, threads } = payload;
      await loadPipeline(modelId, device, dtype, threads);
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        error: `Ошибка загрузки модели: ${err.message || err}`,
      });
    }
    return;
  }

  if (type === 'TRANSCRIBE') {
    isCancelled = false;
    const {
      audioData,
      modelId,
      device,
      dtype,
      threads,
      language,
      task = 'transcribe',
      timestamps = true,
    } = payload;

    try {
      const pipe = await loadPipeline(modelId, device, dtype, threads);

      const sampleRate = 16000;
      const totalSamples = audioData.length;
      const totalDurationSec = totalSamples / sampleRate;

      self.postMessage({
        type: 'STATUS',
        message: `Запуск транскрибации (${totalDurationSec.toFixed(1)} сек)...`,
      });

      const chunkMaxSec = 30;
      const chunkMinSec = 22;
      const nominalChunkSamples = chunkMaxSec * sampleRate;
      const minChunkSamples = chunkMinSec * sampleRate;

      const segments = [];
      let currentSample = 0;
      let chunkIndex = 0;

      // Approximate total chunks for progress estimate
      const estimatedTotalChunks = Math.max(1, Math.ceil(totalDurationSec / 26));

      while (currentSample < totalSamples) {
        if (isCancelled) {
          self.postMessage({ type: 'CANCELLED', partialSegments: segments });
          return;
        }

        const remainingSamples = totalSamples - currentSample;
        let splitSample;

        if (remainingSamples <= nominalChunkSamples) {
          splitSample = totalSamples;
        } else {
          // Find silence between minChunkSamples and nominalChunkSamples
          splitSample = findBestSplitSample(
            audioData,
            currentSample + minChunkSamples,
            currentSample + nominalChunkSamples
          );
        }

        const chunkAudio = audioData.subarray(currentSample, splitSample);
        const chunkStartSec = currentSample / sampleRate;
        const chunkEndSec = splitSample / sampleRate;

        chunkIndex++;
        const progressPercent = Math.min(99, Math.round((splitSample / totalSamples) * 100));

        self.postMessage({
          type: 'TRANSCRIBE_PROGRESS',
          chunkIndex,
          estimatedTotalChunks,
          currentSec: chunkEndSec,
          totalSec: totalDurationSec,
          percent: progressPercent,
        });

        const options = {
          task,
          return_timestamps: timestamps ? true : false,
        };
        if (language && language !== 'auto') {
          options.language = language;
        }

        const result = await pipe(chunkAudio, options);

        // Process chunk results and offset timestamps
        let chunkText = (result.text || '').trim();
        let chunkSegments = [];

        if (result.chunks && result.chunks.length > 0) {
          for (const item of result.chunks) {
            const rawStart = Array.isArray(item.timestamp) ? item.timestamp[0] : 0;
            const rawEnd = Array.isArray(item.timestamp)
              ? item.timestamp[1]
              : rawStart + 2;

            const segStart = chunkStartSec + (rawStart ?? 0);
            const segEnd = chunkStartSec + (rawEnd ?? (rawStart ? rawStart + 2 : 2));
            const text = (item.text || '').trim();

            if (text) {
              const seg = {
                id: segments.length + chunkSegments.length + 1,
                start: segStart,
                end: Math.min(totalDurationSec, segEnd),
                text,
              };
              chunkSegments.push(seg);
            }
          }
        }

        // Fallback if no sub-chunks returned but text exists
        if (chunkSegments.length === 0 && chunkText) {
          chunkSegments.push({
            id: segments.length + 1,
            start: chunkStartSec,
            end: chunkEndSec,
            text: chunkText,
          });
        }

        for (const seg of chunkSegments) {
          segments.push(seg);
          self.postMessage({
            type: 'NEW_SEGMENT',
            segment: seg,
          });
        }

        currentSample = splitSample;
      }

      const fullText = segments.map((s) => s.text).join(' ');

      self.postMessage({
        type: 'TRANSCRIBE_COMPLETE',
        segments,
        fullText,
        duration: totalDurationSec,
      });
    } catch (err) {
      console.error('Transcription error in worker:', err);
      self.postMessage({
        type: 'ERROR',
        error: `Ошибка инференса: ${err.message || err}`,
      });
    }
  }
});
