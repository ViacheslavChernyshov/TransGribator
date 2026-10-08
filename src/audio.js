/**
 * Audio decoding and waveform visualizer module.
 * Converts any browser-supported video/audio format into 16kHz mono Float32Array for Whisper.
 */

export async function decodeMediaAudio(file, onStatusUpdate = () => {}) {
  onStatusUpdate({ status: 'reading', message: 'Чтение файла в память...' });
  const arrayBuffer = await file.arrayBuffer();

  onStatusUpdate({ status: 'decoding', message: 'Декодирование аудиопотока через Web Audio...' });
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  let audioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    if (audioContext.close) await audioContext.close();
    throw new Error(`Не удалось декодировать аудиопоток: ${err.message || 'Формат не поддерживается браузером'}`);
  }

  const duration = audioBuffer.duration;
  const targetSampleRate = 16000;
  const totalTargetSamples = Math.ceil(duration * targetSampleRate);

  onStatusUpdate({
    status: 'resampling',
    message: `Ресемплинг в 16 000 Гц моно (${(duration).toFixed(1)} сек)...`,
  });

  // Resample to 16kHz mono using high-speed OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(1, totalTargetSamples, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const resampledBuffer = await offlineCtx.startRendering();
  const float32Data = resampledBuffer.getChannelData(0);

  if (audioContext.close) {
    try {
      await audioContext.close();
    } catch (_) {}
  }

  onStatusUpdate({ status: 'waveform', message: 'Генерация формы волны...' });
  const peaks = calculatePeaks(float32Data, 350);

  return {
    audioData: float32Data,
    duration,
    sampleRate: targetSampleRate,
    peaks,
  };
}

/**
 * Calculates normalized peaks for waveform rendering
 */
export function calculatePeaks(channelData, barCount = 350) {
  const step = Math.floor(channelData.length / barCount);
  const peaks = [];
  let globalMax = 0.0001;

  for (let i = 0; i < barCount; i++) {
    const start = i * step;
    let max = 0;
    // Sample a few points per bar to be super fast
    const sampleStep = Math.max(1, Math.floor(step / 32));
    for (let j = 0; j < step; j += sampleStep) {
      const absVal = Math.abs(channelData[start + j] || 0);
      if (absVal > max) max = absVal;
    }
    if (max > globalMax) globalMax = max;
    peaks.push(max);
  }

  // Normalize between 0.05 (min visual height) and 1.0
  return peaks.map((p) => Math.max(0.08, p / globalMax));
}

/**
 * Renders modern animated audio waveform on canvas
 */
export function drawWaveform(canvas, peaks, progressRatio = 0, hoverRatio = -1) {
  if (!canvas || !peaks || peaks.length === 0) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const barCount = peaks.length;
  const gap = 2;
  const totalGaps = (barCount - 1) * gap;
  const barWidth = Math.max(1.5, (width - totalGaps) / barCount);
  const centerY = height / 2;

  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + gap);
    const barProgress = i / barCount;
    const peakHeight = Math.max(4, peaks[i] * (height - 8));
    const yTop = centerY - peakHeight / 2;

    const isPlayed = barProgress <= progressRatio;
    const isHovered = hoverRatio >= 0 && barProgress <= hoverRatio;

    // Gradient styling for played vs upcoming
    if (isPlayed) {
      const grad = ctx.createLinearGradient(0, yTop, 0, yTop + peakHeight);
      grad.addColorStop(0, '#06b6d4'); // Electric cyan
      grad.addColorStop(1, '#8b5cf6'); // Violet
      ctx.fillStyle = grad;
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    }

    // Rounded bars
    const radius = Math.min(2, barWidth / 2);
    ctx.beginPath();
    ctx.roundRect(x, yTop, barWidth, peakHeight, radius);
    ctx.fill();
  }

  // Draw current playback scrubber line
  if (progressRatio > 0 && progressRatio <= 1) {
    const scrubX = progressRatio * width;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(scrubX, 0);
    ctx.lineTo(scrubX, height);
    ctx.stroke();
  }

  ctx.restore();
}
