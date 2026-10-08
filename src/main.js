import './style.css';
import { decodeMediaAudio, drawWaveform } from './audio.js';
import {
  formatDuration,
  generateTxt,
  downloadFile,
  formatBytes,
} from './utils.js';
import { translations } from './i18n.js';

// Application State
const state = {
  currentFile: null,
  fileUrl: null,
  isVideo: false,
  audioData: null,
  duration: 0,
  peaks: [],
  segments: [],
  isProcessing: false,
  isPreloading: false,
  activeModelId: 'onnx-community/whisper-large-v3-turbo',
  viewMode: 'subtitles', // 'subtitles' | 'article'
  activeSegmentId: null,
  searchQuery: '',
  lang: localStorage.getItem('tg_lang') || 'uk',
  theme: localStorage.getItem('tg_theme') || 'dark',
  hwInfo: null,
};

// DOM Elements
const elements = {
  // Localization & Theme
  pageTitle: document.getElementById('page-title'),
  pageMetaDesc: document.getElementById('page-meta-desc'),
  brandTagline: document.getElementById('brand-tagline'),
  btnLangUk: document.getElementById('btn-lang-uk'),
  btnLangEn: document.getElementById('btn-lang-en'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),

  // Header status
  osStatusLabel: document.getElementById('os-status-label'),
  osStatusPill: document.getElementById('os-status-pill'),
  osStatusIcon: document.getElementById('os-status-icon'),
  gpuStatusLabel: document.getElementById('gpu-status-label'),
  gpuStatusPill: document.getElementById('gpu-status-pill'),
  gpuStatusDot: document.getElementById('gpu-status-dot'),
  btnInfoModal: document.getElementById('btn-info-modal'),
  btnInfoLabel: document.getElementById('btn-info-label'),
  linuxModal: document.getElementById('linux-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCloseModalConfirm: document.getElementById('btn-close-modal-confirm'),

  // Compact Hardware Strip
  hwCard: document.getElementById('hardware-card'),
  hwValOs: document.getElementById('hw-val-os'),
  hwValGpu: document.getElementById('hw-val-gpu'),
  hwValType: document.getElementById('hw-val-type'),
  hwValCpu: document.getElementById('hw-val-cpu'),
  hwBackendBadge: document.getElementById('hw-backend-badge'),
  hwStatusDot: document.getElementById('hw-status-dot'),
  hwItemBackend: document.getElementById('hw-item-backend'),
  hwItemGpu: document.getElementById('hw-item-gpu'),
  hwItemOs: document.getElementById('hw-item-os'),
  hwItemCpu: document.getElementById('hw-item-cpu'),
  hwIconOs: document.getElementById('hw-icon-os'),

  // Dropzone
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  btnSelectFile: document.getElementById('btn-select-file'),
  btnSelectLabel: document.getElementById('btn-select-label'),
  dropTitle: document.getElementById('drop-title'),
  dropContentIdle: document.getElementById('drop-content-idle'),
  dropContentActive: document.getElementById('drop-content-active'),
  fileNameLabel: document.getElementById('file-name-label'),
  fileSubInfo: document.getElementById('file-sub-info'),
  btnRemoveFile: document.getElementById('btn-remove-file'),

  // Media Player
  mediaCard: document.getElementById('media-card'),
  mediaCardTitle: document.getElementById('media-card-title'),
  videoContainer: document.getElementById('video-container'),
  videoPlayer: document.getElementById('video-player'),
  audioPlayer: document.getElementById('audio-player'),
  mediaTimeDisplay: document.getElementById('media-time-display'),
  waveformCanvas: document.getElementById('waveform-canvas'),
  waveformTooltip: document.getElementById('waveform-tooltip'),
  btnPlayPause: document.getElementById('btn-play-pause'),
  iconPlay: document.getElementById('icon-play'),
  iconPause: document.getElementById('icon-pause'),
  btnBackward: document.getElementById('btn-backward'),
  btnForward: document.getElementById('btn-forward'),
  selectPlaybackSpeed: document.getElementById('select-playback-speed'),

  // AI Whisper Configuration
  configCard: document.getElementById('config-card'),
  configCardTitle: document.getElementById('config-card-title'),
  labelModelText: document.getElementById('label-model-text'),
  selectModel: document.getElementById('select-model'),
  modelSizeHint: document.getElementById('model-size-hint'),
  modelCacheBadge: document.getElementById('model-cache-badge'),
  modelCacheLabel: document.getElementById('model-cache-label'),
  btnPreloadModel: document.getElementById('btn-preload-model'),
  btnPreloadLabel: document.getElementById('btn-preload-label'),

  labelDeviceText: document.getElementById('label-device-text'),
  selectDevice: document.getElementById('select-device'),

  labelPrecisionText: document.getElementById('label-precision-text'),
  selectPrecision: document.getElementById('select-precision'),
  precisionHint: document.getElementById('precision-hint'),

  labelThreadsText: document.getElementById('label-threads-text'),
  selectThreads: document.getElementById('select-threads'),
  threadsHint: document.getElementById('threads-hint'),

  labelLanguageText: document.getElementById('label-language-text'),
  selectLanguage: document.getElementById('select-language'),

  labelTaskText: document.getElementById('label-task-text'),
  selectTask: document.getElementById('select-task'),

  labelTimestampsText: document.getElementById('label-timestamps-text'),
  checkTimestamps: document.getElementById('check-timestamps'),
  labelCheckTimestamps: document.getElementById('label-check-timestamps'),

  btnTranscribe: document.getElementById('btn-transcribe'),
  btnTranscribeLabel: document.getElementById('btn-transcribe-label'),
  btnCancel: document.getElementById('btn-cancel'),
  btnCancelLabel: document.getElementById('btn-cancel-label'),

  progressBox: document.getElementById('progress-box'),
  progressStageBadge: document.getElementById('progress-stage-badge'),
  progressPercentLabel: document.getElementById('progress-percent-label'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressStatusText: document.getElementById('progress-status-text'),

  // Transcription Studio
  studioTitle: document.getElementById('studio-title'),
  statDurLabel: document.getElementById('stat-dur-label'),
  statWordsLabel: document.getElementById('stat-words-label'),
  statSegsLabel: document.getElementById('stat-segs-label'),
  statDuration: document.getElementById('stat-duration'),
  statWords: document.getElementById('stat-words'),
  statSegments: document.getElementById('stat-segments'),

  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  tabSubtitles: document.getElementById('tab-subtitles'),
  tabArticle: document.getElementById('tab-article'),

  btnCopy: document.getElementById('btn-copy'),
  btnCopyLabel: document.getElementById('btn-copy-label'),
  btnDownloadTxt: document.getElementById('btn-download-txt'),
  btnDownloadLabel: document.getElementById('btn-download-label'),

  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyDesc: document.getElementById('empty-desc'),
  featPrivacy: document.getElementById('feat-privacy'),
  featHardware: document.getElementById('feat-hardware'),
  featSeek: document.getElementById('feat-seek'),

  subtitlesFeed: document.getElementById('subtitles-feed'),
  articleView: document.getElementById('article-view'),
  articleTextarea: document.getElementById('article-textarea'),

  // Modal
  modalTitle: document.getElementById('modal-title'),
  modalSec1Title: document.getElementById('modal-sec1-title'),
  modalSec1Desc: document.getElementById('modal-sec1-desc'),
  modalSec1CmdLabel: document.getElementById('modal-sec1-cmd-label'),
  modalSec2Title: document.getElementById('modal-sec2-title'),
  modalSec2Desc: document.getElementById('modal-sec2-desc'),
  modalSec2Note: document.getElementById('modal-sec2-note'),
  modalSec3Title: document.getElementById('modal-sec3-title'),
  modalSec3Desc: document.getElementById('modal-sec3-desc'),
  modalSec3Note: document.getElementById('modal-sec3-note'),

  toastContainer: document.getElementById('toast-container'),
};

// Translation helper
function t(key, ...args) {
  const dict = translations[state.lang] || translations.uk;
  const val = dict[key] !== undefined ? dict[key] : (translations.uk[key] || key);
  if (typeof val === 'function') {
    return val(...args);
  }
  return val;
}

// Check if a model is cached in browser CacheStorage
async function isModelCached(modelId) {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    const matching = keys.filter((req) => req.url.includes(modelId));
    const hasWeights = matching.some((req) => req.url.includes('.onnx') || req.url.includes('.onnx_data'));
    return hasWeights || matching.length >= 3;
  } catch (err) {
    console.warn('Cache check error:', err);
    return false;
  }
}

// Update model cache status badge and preload button
async function updateModelCacheStatus(modelId) {
  const cached = await isModelCached(modelId);
  if (!elements.modelCacheBadge || !elements.btnPreloadModel) return;

  if (cached) {
    elements.modelCacheBadge.className = 'cache-status-badge cached';
    elements.modelCacheLabel.textContent = t('cache_in_cache');
    elements.btnPreloadModel.classList.add('cached-state');
    elements.btnPreloadLabel.textContent = t('btn_preload_ready');
    elements.btnPreloadModel.disabled = false;
  } else {
    elements.modelCacheBadge.className = 'cache-status-badge not-cached';
    elements.modelCacheLabel.textContent = t('cache_not_cached');
    elements.btnPreloadModel.classList.remove('cached-state');
    if (!state.isPreloading) {
      elements.btnPreloadLabel.textContent = t('btn_preload_model');
      elements.btnPreloadModel.disabled = false;
    }
  }
}

// Language Management
function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('tg_lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Toggle active buttons
  if (elements.btnLangUk && elements.btnLangEn) {
    elements.btnLangUk.classList.toggle('active', lang === 'uk');
    elements.btnLangEn.classList.toggle('active', lang === 'en');
  }

  // Update page title & meta
  if (elements.pageTitle) elements.pageTitle.textContent = t('app_title');
  if (elements.pageMetaDesc) elements.pageMetaDesc.setAttribute('content', t('app_meta_desc'));

  // Header & Modal
  if (elements.brandTagline) elements.brandTagline.textContent = t('brand_tagline');
  if (elements.btnInfoLabel) elements.btnInfoLabel.textContent = t('btn_linux');
  if (elements.btnInfoModal) elements.btnInfoModal.title = t('btn_linux');
  if (elements.btnThemeToggle) elements.btnThemeToggle.title = t('theme_toggle_title');

  // Hardware Strip tooltips
  if (elements.hwItemBackend) elements.hwItemBackend.title = t('hw_backend_title');
  if (elements.hwItemGpu) elements.hwItemGpu.title = t('hw_gpu_title');
  if (elements.hwItemOs) elements.hwItemOs.title = t('hw_os_title');
  if (elements.hwItemCpu) elements.hwItemCpu.title = t('hw_cpu_title');

  // Dropzone
  if (elements.dropTitle) elements.dropTitle.textContent = t('drop_title');
  if (elements.btnSelectLabel) elements.btnSelectLabel.textContent = t('drop_btn_select');
  if (elements.btnRemoveFile) elements.btnRemoveFile.title = t('btn_remove_file_title');

  // Media Player
  if (elements.mediaCardTitle) elements.mediaCardTitle.textContent = t('media_player_title');
  if (elements.btnPlayPause) elements.btnPlayPause.title = t('player_play_pause');
  if (elements.btnBackward) {
    elements.btnBackward.title = t('player_backward_title');
    elements.btnBackward.textContent = t('player_backward_text');
  }
  if (elements.btnForward) {
    elements.btnForward.title = t('player_forward_title');
    elements.btnForward.textContent = t('player_forward_text');
  }

  // Inference Settings
  if (elements.configCardTitle) elements.configCardTitle.textContent = t('config_title');
  if (elements.labelModelText) elements.labelModelText.textContent = t('label_model');
  if (elements.labelDeviceText) elements.labelDeviceText.textContent = t('label_acceleration');
  if (elements.labelPrecisionText) elements.labelPrecisionText.textContent = t('label_precision');
  if (elements.labelThreadsText) elements.labelThreadsText.textContent = t('label_threads');
  if (elements.labelLanguageText) elements.labelLanguageText.textContent = t('label_language');
  if (elements.labelTaskText) elements.labelTaskText.textContent = t('label_task');
  if (elements.labelTimestampsText) elements.labelTimestampsText.textContent = t('label_timestamps');
  if (elements.labelCheckTimestamps) elements.labelCheckTimestamps.textContent = t('check_timestamps_label');

  // Model options
  if (elements.selectModel) {
    const curModel = elements.selectModel.value;
    const isUk = lang === 'uk';
    const modelTexts = isUk
      ? {
          'onnx-community/whisper-large-v3-turbo': '⭐ Whisper Large-v3-Turbo (~1.5 ГБ • FP16 • Топ швидкість + якість)',
          'onnx-community/whisper-large-v3-ONNX': '👑 Whisper Large-v3 (~2.9 ГБ • 32 шари • Еталонне SOTA)',
          'onnx-community/whisper-small': '🚀 Whisper Small (~450–950 МБ • Баланс якості та швидкості)',
          'onnx-community/whisper-base': '⚡ Whisper Base (~145–290 МБ • Швидкий драфт)',
          'onnx-community/whisper-tiny': '🌐 Whisper Tiny (~75–150 МБ • Ультралегкий)',
        }
      : {
          'onnx-community/whisper-large-v3-turbo': '⭐ Whisper Large-v3-Turbo (~1.5 GB • FP16 • Top speed + quality)',
          'onnx-community/whisper-large-v3-ONNX': '👑 Whisper Large-v3 (~2.9 GB • 32 layers • Benchmark SOTA)',
          'onnx-community/whisper-small': '🚀 Whisper Small (~450–950 MB • Quality & speed balance)',
          'onnx-community/whisper-base': '⚡ Whisper Base (~145–290 MB • Fast draft)',
          'onnx-community/whisper-tiny': '🌐 Whisper Tiny (~75–150 MB • Ultralight)',
        };
    Array.from(elements.selectModel.options).forEach((opt) => {
      if (modelTexts[opt.value]) opt.textContent = modelTexts[opt.value];
    });
    elements.selectModel.value = curModel;
  }

  // Transcribe & Cancel Buttons
  if (elements.btnTranscribeLabel) elements.btnTranscribeLabel.textContent = t('btn_transcribe');
  if (elements.btnCancelLabel) elements.btnCancelLabel.textContent = t('btn_cancel');

  // Device dropdown options
  if (elements.selectDevice) {
    const autoOpt = elements.selectDevice.querySelector('option[value="auto"]');
    if (autoOpt) autoOpt.textContent = t('device_auto');
    const wasmOpt = elements.selectDevice.querySelector('option[value="wasm"]');
    if (wasmOpt) wasmOpt.textContent = t('device_wasm');
  }

  // Precision options
  if (elements.selectPrecision) {
    const maxOpt = elements.selectPrecision.querySelector('option[value="max"]');
    if (maxOpt) maxOpt.textContent = t('precision_max');
    const ecoOpt = elements.selectPrecision.querySelector('option[value="eco"]');
    if (ecoOpt) ecoOpt.textContent = t('precision_eco');
  }

  // Task options
  if (elements.selectTask) {
    const transcribeOpt = elements.selectTask.querySelector('option[value="transcribe"]');
    if (transcribeOpt) transcribeOpt.textContent = t('task_transcribe');
    const translateOpt = elements.selectTask.querySelector('option[value="translate"]');
    if (translateOpt) translateOpt.textContent = t('task_translate');
  }

  // Spoken Language options
  if (elements.selectLanguage) {
    const curVal = elements.selectLanguage.value;
    const langDict = translations[lang].languages || {};
    Array.from(elements.selectLanguage.options).forEach((opt) => {
      if (langDict[opt.value]) {
        opt.textContent = langDict[opt.value];
      }
    });
    elements.selectLanguage.value = curVal;
  }

  // Studio
  if (elements.studioTitle) elements.studioTitle.textContent = t('studio_title');
  if (elements.statDurLabel) elements.statDurLabel.textContent = t('stat_duration');
  if (elements.statWordsLabel) elements.statWordsLabel.textContent = t('stat_words');
  if (elements.statSegsLabel) elements.statSegsLabel.textContent = t('stat_segments');
  if (elements.searchInput) elements.searchInput.placeholder = t('search_placeholder');
  if (elements.searchClear) elements.searchClear.title = t('search_clear_title');
  if (elements.tabSubtitles) elements.tabSubtitles.textContent = t('tab_subtitles');
  if (elements.tabArticle) elements.tabArticle.textContent = t('tab_article');
  if (elements.btnCopyLabel) elements.btnCopyLabel.textContent = t('btn_copy');
  if (elements.btnDownloadLabel) elements.btnDownloadLabel.textContent = t('btn_download_txt');
  if (elements.btnDownloadTxt) elements.btnDownloadTxt.title = t('btn_download_txt_title');

  // Empty state
  if (elements.emptyTitle) elements.emptyTitle.textContent = t('empty_title');
  if (elements.emptyDesc) elements.emptyDesc.textContent = t('empty_desc');
  if (elements.featPrivacy) elements.featPrivacy.textContent = t('feat_privacy');
  if (elements.featHardware) elements.featHardware.textContent = t('feat_hardware');
  if (elements.featSeek) elements.featSeek.textContent = t('feat_seek');
  if (elements.articleTextarea) elements.articleTextarea.placeholder = t('article_placeholder');

  // Modal
  if (elements.modalTitle) elements.modalTitle.textContent = t('modal_title');
  if (elements.modalSec1Title) elements.modalSec1Title.textContent = t('modal_sec1_title');
  if (elements.modalSec1Desc) elements.modalSec1Desc.innerHTML = t('modal_sec1_desc');
  if (elements.modalSec1CmdLabel) elements.modalSec1CmdLabel.textContent = t('modal_sec1_cmd_label');
  if (elements.modalSec2Title) elements.modalSec2Title.textContent = t('modal_sec2_title');
  if (elements.modalSec2Desc) elements.modalSec2Desc.innerHTML = t('modal_sec2_desc');
  if (elements.modalSec2Note) elements.modalSec2Note.innerHTML = t('modal_sec2_note');
  if (elements.modalSec3Title) elements.modalSec3Title.textContent = t('modal_sec3_title');
  if (elements.modalSec3Desc) elements.modalSec3Desc.innerHTML = t('modal_sec3_desc');
  if (elements.modalSec3Note) elements.modalSec3Note.innerHTML = t('modal_sec3_note');
  if (elements.btnCloseModalConfirm) elements.btnCloseModalConfirm.textContent = t('modal_btn_close');

  // Re-run hardware & CPU selector formatting with new language
  if (state.hwInfo) {
    applyHardwareEnvironmentUi(state.hwInfo);
  }
  initCpuThreadsSelector();
  updateModelSizeHint();
  updateModelCacheStatus(elements.selectModel.value);
}

// Theme Management
function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('tg_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  if (elements.themeIcon) {
    elements.themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  }
}

// Instantiate Web Worker for Whisper AI Pipeline
let worker = null;

function initWorker() {
  if (worker) worker.terminate();

  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

  worker.addEventListener('message', (event) => {
    const { type } = event.data;

    switch (type) {
      case 'MODEL_STATUS':
        setProgress(
          event.data.status,
          parseInt(elements.progressBarFill.style.width) || 0,
          t('stage_model_loading')
        );
        break;

      case 'MODEL_PROGRESS': {
        const { percent, loaded, total } = event.data;
        const loadedMb = formatBytes(loaded);
        const totalMb = total > 0 ? formatBytes(total) : '';
        const stage = t('stage_weights_download');
        const text = total > 0 ? `${stage}: ${loadedMb} / ${totalMb}` : `${stage}: ${loadedMb}`;
        setProgress(text, percent, stage);
        if (state.isPreloading && elements.btnPreloadLabel) {
          elements.btnPreloadLabel.textContent = `${Math.round(percent)}%`;
        }
        break;
      }

      case 'MODEL_READY': {
        const threadStr = event.data.threads > 0 ? ` [${t('coresCount', event.data.threads)}]` : '';
        setProgress(t('progress_model_ready', event.data.device.toUpperCase(), threadStr), 10, t('stage_inference'));

        if (state.isPreloading) {
          state.isPreloading = false;
          elements.progressBox.classList.add('hidden');
          showToast(t('toast_preload_done'), 'success');
        }
        updateModelCacheStatus(elements.selectModel.value);
        break;
      }

      case 'STATUS':
        elements.progressStatusText.textContent = event.data.message;
        break;

      case 'TRANSCRIBE_PROGRESS': {
        const { chunkIndex, estimatedTotalChunks, currentSec, totalSec, percent } = event.data;
        const text = t('progress_chunk', chunkIndex, estimatedTotalChunks, formatDuration(currentSec), formatDuration(totalSec));
        setProgress(text, percent, t('stage_transcribe'));
        break;
      }

      case 'NEW_SEGMENT':
        addSegment(event.data.segment);
        break;

      case 'TRANSCRIBE_COMPLETE':
        onTranscriptionDone(event.data);
        break;

      case 'CANCELLED':
        onTranscriptionCancelled(event.data?.partialSegments);
        break;

      case 'ERROR':
        if (state.isPreloading) {
          state.isPreloading = false;
          elements.progressBox.classList.add('hidden');
          updateModelCacheStatus(elements.selectModel.value);
        }
        onTranscriptionError(event.data.error);
        break;
    }
  });
}

function detectOperatingSystem() {
  const ua = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';

  const winSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801"/></svg>';
  const linuxSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.5 2.8 1.4 3.7C6.6 11.2 5 13.8 5 17c0 .5.1 1.1.2 1.6C4.4 19 3 20.5 3 22h18c0-1.5-1.4-3-2.2-3.4.1-.5.2-1.1.2-1.6 0-3.2-1.6-5.8-3.9-6.8.9-.9 1.4-2.2 1.4-3.7C16.5 4 14.5 2 12 2z"/></svg>';
  const macSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-.99 1.74-.85 2.76 1.01.08 2-.54 2.58-1.26z"/></svg>';
  const genericSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';

  if (/windows/i.test(platform) || /windows/i.test(ua)) {
    let name = 'Windows';
    if (/Windows NT 10.0/i.test(ua)) {
      name = 'Windows 10 / 11';
    } else if (/Windows NT 6.3/i.test(ua)) {
      name = 'Windows 8.1';
    } else if (/Windows NT 6.1/i.test(ua)) {
      name = 'Windows 7';
    }
    const arch = /x64|win64|wow64/i.test(ua) ? ' (x64)' : '';
    return { name: `${name}${arch}`, shortName: name, iconSvg: winSvg, key: 'windows' };
  }
  if (/linux/i.test(platform) || /linux/i.test(ua)) {
    return { name: 'Linux (x86_64)', shortName: 'Linux', iconSvg: linuxSvg, key: 'linux' };
  }
  if (/mac/i.test(platform) || /macintosh|mac os x/i.test(ua)) {
    return { name: 'macOS', shortName: 'macOS', iconSvg: macSvg, key: 'macos' };
  }
  if (/android/i.test(ua)) {
    return { name: 'Android', shortName: 'Android', iconSvg: genericSvg, key: 'android' };
  }
  if (/iphone|ipad|ipod/i.test(ua)) {
    return { name: 'iOS', shortName: 'iOS', iconSvg: macSvg, key: 'ios' };
  }
  return { name: 'Desktop OS', shortName: 'PC', iconSvg: genericSvg, key: 'generic' };
}

function cleanGpuName(raw) {
  if (!raw) return '';
  let s = raw.trim();
  if (s.startsWith('ANGLE (')) {
    s = s.replace(/^ANGLE\s*\([^,]+,\s*/i, '');
    s = s.replace(/\s*\(0x[0-9a-fA-F]+\)/g, '');
    s = s.replace(/\s+(Direct3D|OpenGL|Vulkan|Metal).*/i, '');
    s = s.replace(/\)+$/, '');
  }
  return s.trim();
}

function getWebGLRendererInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const rawRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        const rawVendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        return {
          rawRenderer,
          rawVendor,
          cleanedRenderer: cleanGpuName(rawRenderer),
        };
      }
    }
  } catch (_) {}
  return null;
}

function classifyHardware(gpuName, isFallback = false) {
  const lower = (gpuName || '').toLowerCase();

  if (isFallback || /swiftshader|warp|llvmpipe|software/i.test(lower)) {
    return {
      type: 'cpu-software',
      labelUA: 'Програмний рендерер (CPU)',
      labelEN: 'Software Renderer (CPU)',
      category: 'CPU',
      badge: 'CPU Soft',
      icon: '💻',
      isGpu: false,
    };
  }

  // Check NPU / WebNN
  const hasWebNN = typeof navigator !== 'undefined' && 'ml' in navigator;
  if (/npu|neural|hexagon|snapdragon x|ai boost/i.test(lower) || hasWebNN) {
    return {
      type: 'npu',
      labelUA: 'Нейропроцесор (NPU / AI Engine)',
      labelEN: 'Neural Processor (NPU)',
      category: 'NPU',
      badge: 'NPU',
      icon: '🧠',
      isGpu: true,
    };
  }

  // Discrete GPU keywords
  if (/geforce|rtx|gtx|quadro|tesla|radeon\s*(rx|pro|vega\s*\d{2})|intel arc|a770|a750|a580|b580/i.test(lower)) {
    return {
      type: 'dgpu',
      labelUA: 'Дискретна графіка (dGPU)',
      labelEN: 'Discrete Graphics (dGPU)',
      category: 'dGPU',
      badge: 'dGPU',
      icon: '🎮',
      isGpu: true,
    };
  }

  // Integrated GPU keywords
  if (/intel.*(uhd|hd|iris)|radeon graphics|apple m|adreno|mali/i.test(lower)) {
    return {
      type: 'igpu',
      labelUA: 'Вбудована графіка (iGPU)',
      labelEN: 'Integrated Graphics (iGPU)',
      category: 'iGPU',
      badge: 'iGPU',
      icon: '⚡',
      isGpu: true,
    };
  }

  if (gpuName && !/unknown|generic/i.test(lower)) {
    return {
      type: 'gpu',
      labelUA: 'Графічний прискорювач (GPU)',
      labelEN: 'Graphics Accelerator (GPU)',
      category: 'GPU',
      badge: 'GPU',
      icon: '⚡',
      isGpu: true,
    };
  }

  return {
    type: 'cpu',
    labelUA: 'Процесор (CPU багатопотік)',
    labelEN: 'CPU Multi-threaded',
    category: 'CPU',
    badge: 'CPU',
    icon: '💻',
    isGpu: false,
  };
}

// Update UI elements for Hardware Environment
function applyHardwareEnvironmentUi(hw) {
  const { os, cores, hasWebGpu, gpuName, classification } = hw;

  // Header OS status pill
  if (elements.osStatusLabel) {
    elements.osStatusLabel.textContent = `${os.shortName} • ${t('coresCount', cores)}`;
  }
  if (elements.osStatusPill) {
    elements.osStatusPill.title = `${os.name} (${t('coresCount', cores)})`;
  }
  if (elements.osStatusIcon && os.iconSvg) {
    elements.osStatusIcon.innerHTML = os.iconSvg;
  }

  // Header GPU status pill
  if (elements.gpuStatusLabel) {
    if (hasWebGpu) {
      elements.gpuStatusLabel.textContent = `${t('gpu_webgpu_prefix')} ${classification.badge}`;
      elements.gpuStatusPill.title = `WebGPU: ${gpuName}`;
      if (elements.gpuStatusDot) elements.gpuStatusDot.className = 'status-dot';
    } else {
      elements.gpuStatusLabel.textContent = `${t('gpu_cpu_prefix')} ${t('coresCount', cores)}`;
      elements.gpuStatusPill.title = `WASM SIMD (${t('coresCount', cores)})`;
      if (elements.gpuStatusDot) elements.gpuStatusDot.className = 'status-dot warning';
    }
  }

  // Compact Hardware Diagnostics Strip
  if (elements.hwBackendBadge) {
    elements.hwBackendBadge.textContent = hasWebGpu ? 'WebGPU' : 'WASM SIMD';
    elements.hwBackendBadge.className = `hw-strip-badge ${hasWebGpu ? '' : 'cpu'}`;
  }
  if (elements.hwStatusDot) {
    elements.hwStatusDot.className = `status-dot ${hasWebGpu ? '' : 'warning'}`;
  }
  if (elements.hwValGpu) {
    elements.hwValGpu.textContent = gpuName;
    elements.hwValGpu.title = gpuName;
  }
  if (elements.hwValType) {
    elements.hwValType.textContent = classification.badge;
  }
  if (elements.hwValOs) {
    elements.hwValOs.textContent = os.shortName;
  }
  if (elements.hwValCpu) {
    elements.hwValCpu.textContent = t('coresCount', cores);
  }

  // Update Acceleration dropdown options
  if (elements.selectDevice) {
    const webgpuOpt = elements.selectDevice.querySelector('option[value="webgpu"]');
    if (webgpuOpt) {
      const shortName = gpuName.length > 25 ? gpuName.substring(0, 23) + '...' : gpuName;
      webgpuOpt.textContent = `⚡ WebGPU (${classification.category}: ${shortName})`;
    }
  }
}

// Detect hardware capabilities, OS, GPUs on startup
async function detectHardwareEnvironment() {
  const osInfo = detectOperatingSystem();
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;

  let hasWebGpu = false;
  let webgpuAdapter = null;
  let adapterInfo = null;
  let isFallback = false;

  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      webgpuAdapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!webgpuAdapter) {
        webgpuAdapter = await navigator.gpu.requestAdapter();
      }
      if (webgpuAdapter) {
        hasWebGpu = true;
        isFallback = Boolean(webgpuAdapter.isFallbackAdapter);
        adapterInfo = webgpuAdapter.info || null;
        if (!adapterInfo && typeof webgpuAdapter.requestAdapterInfo === 'function') {
          try {
            adapterInfo = await webgpuAdapter.requestAdapterInfo();
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  const webglInfo = getWebGLRendererInfo();

  let gpuName = '';
  if (adapterInfo && (adapterInfo.description || adapterInfo.device)) {
    gpuName = adapterInfo.description || adapterInfo.device;
  }
  if (!gpuName && webglInfo?.cleanedRenderer) {
    gpuName = webglInfo.cleanedRenderer;
  }
  if (!gpuName && adapterInfo?.vendor) {
    gpuName = `${adapterInfo.vendor.toUpperCase()} Graphics`;
  }
  if (!gpuName) {
    gpuName = hasWebGpu ? 'WebGPU Adapter' : 'CPU SIMD';
  }

  const classification = classifyHardware(gpuName, isFallback);

  state.hwInfo = {
    os: osInfo,
    cores,
    hasWebGpu,
    gpuName,
    classification,
    activeDevice: hasWebGpu ? 'webgpu' : 'wasm',
  };

  applyHardwareEnvironmentUi(state.hwInfo);
  return state.hwInfo;
}

// Concise CPU Threads Selector
function initCpuThreadsSelector() {
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;

  if (elements.threadsHint) {
    elements.threadsHint.textContent = t('coresCount', cores);
  }

  if (!elements.selectThreads) return;
  const currentVal = elements.selectThreads.value;
  elements.selectThreads.innerHTML = '';

  const presets = [
    { percent: 100, icon: '⚡' },
    { percent: 75, icon: '🚀' },
    { percent: 50, icon: '⚖️' },
    { percent: 25, icon: '🌱' },
  ];

  const seenThreads = new Set();

  presets.forEach((preset, index) => {
    let threads;
    if (preset.percent === 100) {
      threads = cores;
    } else {
      threads = Math.max(1, Math.round((cores * preset.percent) / 100));
    }

    if (preset.percent < 100 && seenThreads.has(threads)) {
      return;
    }
    seenThreads.add(threads);

    const opt = document.createElement('option');
    opt.value = String(threads);
    opt.dataset.percent = String(preset.percent);
    opt.textContent = `${preset.icon} ${preset.percent}% (${t('coresCount', threads)})`;
    if (currentVal ? String(threads) === currentVal : index === 0) {
      opt.selected = true;
    }

    elements.selectThreads.appendChild(opt);
  });
}

// Helper: Active media player
function getActivePlayer() {
  return state.isVideo ? elements.videoPlayer : elements.audioPlayer;
}

function updatePlaybackUi() {
  const player = getActivePlayer();
  const current = player.currentTime || 0;
  const dur = player.duration || state.duration || 0;

  elements.mediaTimeDisplay.textContent = `${formatDuration(current)} / ${formatDuration(dur)}`;

  const ratio = dur > 0 ? current / dur : 0;
  drawWaveform(elements.waveformCanvas, state.peaks, ratio);

  highlightActiveSubtitle(current);
}

function highlightActiveSubtitle(currentTime) {
  if (state.segments.length === 0) return;

  const active = state.segments.find((s) => currentTime >= s.start && currentTime <= s.end);
  const activeId = active ? active.id : null;

  if (activeId !== state.activeSegmentId) {
    state.activeSegmentId = activeId;
    document.querySelectorAll('.sub-card').forEach((card) => {
      if (card.dataset.id === String(activeId)) {
        card.classList.add('active-playback');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('active-playback');
      }
    });
  }
}

// Waveform click to seek
elements.waveformCanvas.addEventListener('click', (e) => {
  const rect = elements.waveformCanvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const player = getActivePlayer();
  const dur = player.duration || state.duration || 0;
  if (dur > 0) {
    player.currentTime = ratio * dur;
    updatePlaybackUi();
  }
});

// File Loading & Processing
async function handleFileSelected(file) {
  if (!file) return;

  resetApp(false);
  state.currentFile = file;
  state.isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mkv|avi|mov)$/i.test(file.name);

  // Update Dropzone Active Info
  elements.dropContentIdle.classList.add('hidden');
  elements.dropContentActive.classList.remove('hidden');
  elements.fileNameLabel.textContent = file.name;
  elements.fileSubInfo.textContent = `${t('file_size_label')} ${formatBytes(file.size)} • ${t('drop_analyzing')}`;

  // Create Object URL for playback
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  state.fileUrl = URL.createObjectURL(file);

  if (state.isVideo) {
    elements.videoPlayer.src = state.fileUrl;
    elements.videoContainer.classList.remove('hidden');
    elements.audioPlayer.src = '';
  } else {
    elements.audioPlayer.src = state.fileUrl;
    elements.videoContainer.classList.add('hidden');
    elements.videoPlayer.src = '';
  }

  elements.mediaCard.classList.remove('hidden');

  // Decode audio via Web Audio API
  try {
    showToast(t('toast_audio_extracting', formatBytes(file.size)), 'info');
    elements.progressBox.classList.remove('hidden');
    setProgress(t('progress_audio_decoding'), 15, t('stage_audio_prep'));

    const decoded = await decodeMediaAudio(file, ({ message }) => {
      elements.progressStatusText.textContent = message;
    });

    state.audioData = decoded.audioData;
    state.duration = decoded.duration;
    state.peaks = decoded.peaks;

    elements.fileSubInfo.textContent = `${t('file_size_label')} ${formatBytes(file.size)} • ${t('file_duration_label')} ${formatDuration(state.duration)} • ${t('file_mono_info')}`;
    elements.statDuration.textContent = formatDuration(state.duration);
    elements.btnTranscribe.disabled = false;
    elements.progressBox.classList.add('hidden');

    drawWaveform(elements.waveformCanvas, state.peaks, 0);
    updatePlaybackUi();
    showToast(t('toast_audio_ready'), 'success');
  } catch (err) {
    console.error('Audio decode error:', err);
    elements.progressBox.classList.add('hidden');
    showToast(t('toast_audio_error', err.message), 'error');
  }
}

// Drag & Drop events
elements.dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  elements.dropZone.classList.add('dragover');
});

elements.dropZone.addEventListener('dragleave', () => {
  elements.dropZone.classList.remove('dragover');
});

elements.dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  elements.dropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileSelected(e.dataTransfer.files[0]);
  }
});

elements.btnSelectFile.addEventListener('click', () => {
  elements.fileInput.click();
});

elements.fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFileSelected(e.target.files[0]);
  }
});

elements.btnRemoveFile.addEventListener('click', (e) => {
  e.stopPropagation();
  resetApp(true);
});

// Playback controls
elements.btnPlayPause.addEventListener('click', () => {
  const player = getActivePlayer();
  if (player.paused) {
    player.play();
    elements.iconPlay.classList.add('hidden');
    elements.iconPause.classList.remove('hidden');
  } else {
    player.pause();
    elements.iconPlay.classList.remove('hidden');
    elements.iconPause.classList.add('hidden');
  }
});

elements.btnBackward.addEventListener('click', () => {
  const player = getActivePlayer();
  player.currentTime = Math.max(0, player.currentTime - 5);
  updatePlaybackUi();
});

elements.btnForward.addEventListener('click', () => {
  const player = getActivePlayer();
  player.currentTime = Math.min(player.duration || state.duration, player.currentTime + 5);
  updatePlaybackUi();
});

elements.selectPlaybackSpeed.addEventListener('change', (e) => {
  const speed = parseFloat(e.target.value);
  elements.videoPlayer.playbackRate = speed;
  elements.audioPlayer.playbackRate = speed;
});

elements.videoPlayer.addEventListener('timeupdate', updatePlaybackUi);
elements.audioPlayer.addEventListener('timeupdate', updatePlaybackUi);

elements.videoPlayer.addEventListener('ended', () => {
  elements.iconPlay.classList.remove('hidden');
  elements.iconPause.classList.add('hidden');
});
elements.audioPlayer.addEventListener('ended', () => {
  elements.iconPlay.classList.remove('hidden');
  elements.iconPause.classList.add('hidden');
});

// Dynamic model size hint updater
function updateModelSizeHint() {
  const modelId = elements.selectModel.value;
  const precision = elements.selectPrecision ? elements.selectPrecision.value : 'max';
  const isUk = state.lang === 'uk';

  if (modelId.includes('large-v3-ONNX')) {
    if (precision === 'max') {
      elements.modelSizeHint.textContent = isUk
        ? '~2.95 ГБ (FP16) • Флагман OpenAI, 32 шари декодера'
        : '~2.95 GB (FP16) • OpenAI Flagship, 32 decoder layers';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'Чистий FP16 без втрат' : 'Lossless FP16';
    } else {
      elements.modelSizeHint.textContent = isUk
        ? '~1.97 ГБ • Флагман 32 шари (Q4 стиснення)'
        : '~1.97 GB • Flagship 32 layers (Q4 compression)';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'Q4 стиснення декодера' : 'Q4 decoder quantization';
    }
  } else if (modelId.includes('large-v3-turbo')) {
    if (precision === 'max') {
      elements.modelSizeHint.textContent = isUk
        ? '~1.54 ГБ (FP16) • Топ якість + швидкість'
        : '~1.54 GB (FP16) • Top quality + speed';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'Чистий FP16' : 'Lossless FP16';
    } else {
      elements.modelSizeHint.textContent = isUk
        ? '~1.2 ГБ • Q4 стиснення декодера'
        : '~1.2 GB • Q4 decoder quantization';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'Q4 квантування' : 'Q4 quantization';
    }
  } else if (modelId.includes('small')) {
    if (precision === 'max') {
      elements.modelSizeHint.textContent = isUk
        ? '~960 МБ (FP16/FP32) • Максимальна точність Small'
        : '~960 MB (FP16/FP32) • Max accuracy Small';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'FP16 / FP32' : 'FP16 / FP32';
    } else {
      elements.modelSizeHint.textContent = isUk ? '~450 МБ • Q4 стиснення' : '~450 MB • Q4 compression';
      if (elements.precisionHint) elements.precisionHint.textContent = isUk ? 'Q4 квантування' : 'Q4 quantization';
    }
  } else if (modelId.includes('base')) {
    if (precision === 'max') {
      elements.modelSizeHint.textContent = isUk ? '~280 МБ (FP16) • Швидкий драфт' : '~280 MB (FP16) • Fast draft';
      if (elements.precisionHint) elements.precisionHint.textContent = 'FP16';
    } else {
      elements.modelSizeHint.textContent = isUk ? '~145 МБ • Q8 стиснення' : '~145 MB • Q8 compression';
      if (elements.precisionHint) elements.precisionHint.textContent = 'Q8';
    }
  } else if (modelId.includes('tiny')) {
    if (precision === 'max') {
      elements.modelSizeHint.textContent = isUk ? '~150 МБ (FP16) • Ультралегкий' : '~150 MB (FP16) • Ultralight';
      if (elements.precisionHint) elements.precisionHint.textContent = 'FP16';
    } else {
      elements.modelSizeHint.textContent = isUk ? '~75 МБ • Q8 стиснення' : '~75 MB • Q8 compression';
      if (elements.precisionHint) elements.precisionHint.textContent = 'Q8';
    }
  }
}

elements.selectModel.addEventListener('change', () => {
  state.activeModelId = elements.selectModel.value;
  updateModelSizeHint();
  updateModelCacheStatus(elements.selectModel.value);
});

if (elements.selectPrecision) {
  elements.selectPrecision.addEventListener('change', updateModelSizeHint);
}

// Preload Model Button Click Handler
elements.btnPreloadModel.addEventListener('click', async () => {
  if (state.isProcessing || state.isPreloading) return;

  const modelId = elements.selectModel.value;
  const requestedDevice = elements.selectDevice.value;
  let device = requestedDevice;
  if (device === 'auto') {
    const hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
    device = hasWebGpu ? 'webgpu' : 'wasm';
  }

  const precision = elements.selectPrecision ? elements.selectPrecision.value : 'max';
  const threads = elements.selectThreads ? parseInt(elements.selectThreads.value, 10) : 0;

  let dtype;
  if (modelId.includes('large-v3-ONNX') || modelId.includes('large-v3-turbo')) {
    if (precision === 'max') {
      dtype = device === 'webgpu'
        ? { encoder_model: 'fp16', decoder_model_merged: 'fp16' }
        : { encoder_model: 'fp32', decoder_model_merged: 'fp32' };
    } else {
      dtype = device === 'webgpu'
        ? { encoder_model: 'fp16', decoder_model_merged: 'q4' }
        : { encoder_model: 'fp32', decoder_model_merged: 'q4' };
    }
  } else if (modelId.includes('small')) {
    dtype = precision === 'max'
      ? (device === 'webgpu' ? 'fp16' : 'fp32')
      : (device === 'webgpu' ? 'fp16' : 'q4');
  } else {
    dtype = precision === 'max'
      ? (device === 'webgpu' ? 'fp16' : 'fp32')
      : (device === 'webgpu' ? 'fp16' : 'q8');
  }

  state.isPreloading = true;
  elements.btnPreloadModel.disabled = true;
  elements.btnPreloadLabel.textContent = t('btn_preload_downloading');
  elements.progressBox.classList.remove('hidden');
  setProgress(t('toast_preload_started'), 5, t('stage_model_loading'));
  showToast(t('toast_preload_started'), 'info');

  worker.postMessage({
    type: 'PRELOAD_MODEL',
    payload: {
      modelId,
      device,
      dtype,
      threads,
    },
  });
});

// Start Transcription
elements.btnTranscribe.addEventListener('click', async () => {
  if (!state.audioData || state.isProcessing) return;

  state.isProcessing = true;
  state.segments = [];
  elements.subtitlesFeed.innerHTML = '';
  elements.articleTextarea.value = '';
  elements.emptyState.classList.add('hidden');

  if (state.viewMode === 'subtitles') {
    elements.subtitlesFeed.classList.remove('hidden');
    elements.articleView.classList.add('hidden');
  } else {
    elements.subtitlesFeed.classList.add('hidden');
    elements.articleView.classList.remove('hidden');
  }

  elements.btnTranscribe.classList.add('hidden');
  elements.btnCancel.classList.remove('hidden');
  elements.progressBox.classList.remove('hidden');

  const modelId = elements.selectModel.value;
  const requestedDevice = elements.selectDevice.value;
  const language = elements.selectLanguage.value;
  const task = elements.selectTask.value;
  const timestamps = elements.checkTimestamps.checked;
  const threads = elements.selectThreads ? parseInt(elements.selectThreads.value, 10) : 0;
  const precision = elements.selectPrecision ? elements.selectPrecision.value : 'max';

  let device = requestedDevice;
  if (device === 'auto') {
    const hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
    device = hasWebGpu ? 'webgpu' : 'wasm';
  }

  let dtype;
  if (modelId.includes('large-v3-ONNX') || modelId.includes('large-v3-turbo')) {
    if (precision === 'max') {
      dtype = device === 'webgpu'
        ? { encoder_model: 'fp16', decoder_model_merged: 'fp16' }
        : { encoder_model: 'fp32', decoder_model_merged: 'fp32' };
    } else {
      dtype = device === 'webgpu'
        ? { encoder_model: 'fp16', decoder_model_merged: 'q4' }
        : { encoder_model: 'fp32', decoder_model_merged: 'q4' };
    }
  } else if (modelId.includes('small')) {
    dtype = precision === 'max'
      ? (device === 'webgpu' ? 'fp16' : 'fp32')
      : (device === 'webgpu' ? 'fp16' : 'q4');
  } else {
    dtype = precision === 'max'
      ? (device === 'webgpu' ? 'fp16' : 'fp32')
      : (device === 'webgpu' ? 'fp16' : 'q8');
  }

  setProgress(t('stage_init') + '...', 0, t('stage_init'));

  worker.postMessage({
    type: 'TRANSCRIBE',
    payload: {
      audioData: state.audioData,
      modelId,
      device,
      dtype,
      threads,
      language,
      task,
      timestamps,
    },
  });
});

// Cancel Transcription
elements.btnCancel.addEventListener('click', () => {
  if (!state.isProcessing) return;
  worker.postMessage({ type: 'CANCEL' });
  elements.progressStatusText.textContent = t('progress_stopping');
});

// Update progress bar & label
function setProgress(status, percent, stage = null) {
  elements.progressStatusText.textContent = status;
  elements.progressPercentLabel.textContent = `${Math.round(percent)}%`;
  elements.progressBarFill.style.width = `${percent}%`;
  if (stage) elements.progressStageBadge.textContent = stage;
}

// Add newly recognized segment to UI
function addSegment(segment) {
  state.segments.push(segment);

  // Create subtitle card
  const card = document.createElement('div');
  card.className = 'sub-card';
  card.dataset.id = segment.id;

  const timeBtn = document.createElement('button');
  timeBtn.className = 'sub-time-btn';
  timeBtn.title = t('seek_phrase_title');
  timeBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    <span>${formatDuration(segment.start)} - ${formatDuration(segment.end)}</span>
  `;

  timeBtn.addEventListener('click', () => {
    const player = getActivePlayer();
    player.currentTime = segment.start;
    player.play();
    elements.iconPlay.classList.add('hidden');
    elements.iconPause.classList.remove('hidden');
    updatePlaybackUi();
  });

  const textWrapper = document.createElement('div');
  textWrapper.className = 'sub-text-wrapper';

  const textContent = document.createElement('div');
  textContent.className = 'sub-text-content';
  textContent.contentEditable = 'true';
  textContent.spellcheck = true;
  textContent.textContent = segment.text;

  // Listen to manual user edits
  textContent.addEventListener('input', () => {
    segment.text = textContent.textContent;
    syncArticleText();
  });

  textWrapper.appendChild(textContent);
  card.appendChild(timeBtn);
  card.appendChild(textWrapper);

  elements.subtitlesFeed.appendChild(card);

  // Auto scroll down during live transcription
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Update statistics
  updateStats();
  syncArticleText();
}

function updateStats() {
  const totalWords = state.segments.reduce((acc, s) => {
    const words = s.text.trim().split(/\s+/).filter(Boolean);
    return acc + words.length;
  }, 0);

  elements.statWords.textContent = totalWords;
  elements.statSegments.textContent = state.segments.length;
}

function syncArticleText() {
  elements.articleTextarea.value = state.segments.map((s) => s.text.trim()).join(' ');
}

// Handle transcription completion
function onTranscriptionDone() {
  state.isProcessing = false;
  elements.btnTranscribe.classList.remove('hidden');
  elements.btnCancel.classList.add('hidden');
  elements.progressBox.classList.add('hidden');

  updateStats();
  syncArticleText();
  updateModelCacheStatus(elements.selectModel.value);
  showToast(t('toast_transcribe_done'), 'success');
}

function onTranscriptionCancelled() {
  state.isProcessing = false;
  elements.btnTranscribe.classList.remove('hidden');
  elements.btnCancel.classList.add('hidden');
  elements.progressBox.classList.add('hidden');
  showToast(t('toast_transcribe_cancelled'), 'info');
}

function onTranscriptionError(err) {
  state.isProcessing = false;
  elements.btnTranscribe.classList.remove('hidden');
  elements.btnCancel.classList.add('hidden');
  elements.progressBox.classList.add('hidden');
  showToast(t('toast_error', err), 'error');
}

// View switcher
elements.tabSubtitles.addEventListener('click', () => {
  state.viewMode = 'subtitles';
  elements.tabSubtitles.classList.add('active');
  elements.tabArticle.classList.remove('active');
  if (state.segments.length > 0) {
    elements.subtitlesFeed.classList.remove('hidden');
    elements.articleView.classList.add('hidden');
  }
});

elements.tabArticle.addEventListener('click', () => {
  state.viewMode = 'article';
  elements.tabArticle.classList.add('active');
  elements.tabSubtitles.classList.remove('active');
  if (state.segments.length > 0) {
    elements.subtitlesFeed.classList.add('hidden');
    elements.articleView.classList.remove('hidden');
  }
});

// Search input
elements.searchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  state.searchQuery = q;
  elements.searchClear.classList.toggle('hidden', !q);

  document.querySelectorAll('.sub-card').forEach((card) => {
    const textEl = card.querySelector('.sub-text-content');
    const originalText = textEl.textContent;
    if (!q) {
      card.classList.remove('hidden');
      textEl.innerHTML = originalText;
      return;
    }

    if (originalText.toLowerCase().includes(q)) {
      card.classList.remove('hidden');
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      textEl.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
    } else {
      card.classList.add('hidden');
    }
  });
});

elements.searchClear.addEventListener('click', () => {
  elements.searchInput.value = '';
  elements.searchInput.dispatchEvent(new Event('input'));
});

// Copy to Clipboard
elements.btnCopy.addEventListener('click', async () => {
  if (state.segments.length === 0) {
    showToast(t('toast_copy_empty'), 'error');
    return;
  }
  const text = state.segments.map((s) => s.text.trim()).join(' ');
  try {
    await navigator.clipboard.writeText(text);
    elements.btnCopyLabel.textContent = t('btn_copied');
    showToast(t('toast_copy_success'), 'success');
    setTimeout(() => {
      elements.btnCopyLabel.textContent = t('btn_copy');
    }, 2000);
  } catch (_) {
    showToast(t('toast_copy_error'), 'error');
  }
});

// Export TXT transcript
function getExportFileName() {
  if (state.currentFile && state.currentFile.name) {
    const base = state.currentFile.name.replace(/\.[^/.]+$/, '');
    return `${base}.txt`;
  }
  return 'transcript.txt';
}

async function handleSaveTxt() {
  const content = (elements.articleTextarea.value && elements.articleTextarea.value.trim())
    ? elements.articleTextarea.value.trim()
    : generateTxt(state.segments);

  if (!content) {
    showToast(t('toast_save_empty'), 'warning');
    return;
  }

  const fileName = getExportFileName();

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Text Document (*.txt)',
            accept: { 'text/plain': ['.txt'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      showToast(t('toast_file_saved', fileName), 'success');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('showSaveFilePicker error, fallback to download:', err);
    }
  }

  downloadFile(content, fileName, 'text/plain;charset=utf-8');
  showToast(t('toast_file_saved', fileName), 'success');
}

if (elements.btnDownloadTxt) {
  elements.btnDownloadTxt.addEventListener('click', handleSaveTxt);
}

// Modal handling
elements.btnInfoModal.addEventListener('click', () => {
  elements.linuxModal.classList.remove('hidden');
});

elements.btnCloseModal.addEventListener('click', () => {
  elements.linuxModal.classList.add('hidden');
});

elements.btnCloseModalConfirm.addEventListener('click', () => {
  elements.linuxModal.classList.add('hidden');
});

// Toast notification system
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Reset application state
function resetApp(fullReset = true) {
  if (state.isProcessing && worker) {
    worker.postMessage({ type: 'CANCEL' });
  }
  state.isProcessing = false;
  state.segments = [];
  elements.subtitlesFeed.innerHTML = '';
  elements.articleTextarea.value = '';
  elements.emptyState.classList.remove('hidden');
  elements.subtitlesFeed.classList.add('hidden');
  elements.articleView.classList.add('hidden');
  elements.statWords.textContent = '0';
  elements.statSegments.textContent = '0';

  if (fullReset) {
    state.currentFile = null;
    state.audioData = null;
    state.duration = 0;
    state.peaks = [];
    if (state.fileUrl) {
      URL.revokeObjectURL(state.fileUrl);
      state.fileUrl = null;
    }
    elements.videoPlayer.src = '';
    elements.audioPlayer.src = '';
    elements.mediaCard.classList.add('hidden');
    elements.dropContentIdle.classList.remove('hidden');
    elements.dropContentActive.classList.add('hidden');
    elements.fileInput.value = '';
    elements.btnTranscribe.disabled = true;
    elements.statDuration.textContent = '00:00';
  }
}

// Setup Language and Theme Toggles
if (elements.btnLangUk) {
  elements.btnLangUk.addEventListener('click', () => setLanguage('uk'));
}
if (elements.btnLangEn) {
  elements.btnLangEn.addEventListener('click', () => setLanguage('en'));
}
if (elements.btnThemeToggle) {
  elements.btnThemeToggle.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

// Initialize Application
initWorker();
setTheme(state.theme);
detectHardwareEnvironment().then(() => {
  setLanguage(state.lang);
});
