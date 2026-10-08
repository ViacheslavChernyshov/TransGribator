// Internationalization (i18n) for TransGribator
// Supported languages: Ukrainian ('uk') and English ('en')

export const translations = {
  uk: {
    // App & Header
    app_title: 'TransGribator — Локальна транскрибація Whisper (NPU / CPU / WebGPU)',
    app_meta_desc: 'Швидка локальна система транскрибації відео та аудіо на базі Whisper та ONNX Web. 100% приватність, без сторонніх серверів, апаратне прискорення NPU / CPU / WebGPU.',
    brand_tagline: 'Whisper In-Browser • 100% Локально • NPU / CPU / WebGPU',
    btn_linux: 'Запуск на Linux',
    theme_toggle_title: 'Змінити тему оформлення (Темна / Світла)',
    lang_toggle_title: 'Змінити мову інтерфейсу',

    // Status Pills in Header
    os_status_init: 'Визначення ОС...',
    gpu_status_init: 'Ініціалізація...',
    gpu_webgpu_prefix: '⚡ WebGPU:',
    gpu_cpu_prefix: '💻 CPU (WASM SIMD):',

    // Hardware Strip
    hw_backend_title: 'Обчислювальний бекенд',
    hw_gpu_title: 'Графічний прискорювач (GPU / NPU)',
    hw_os_title: 'Операційна система',
    hw_cpu_title: 'Процесорні ядра',
    hw_webgpu_badge: 'WebGPU',
    hw_wasm_badge: 'WASM SIMD',
    hw_detecting: 'Визначення...',
    hw_cpu_cores: (n) => `${n} ядер CPU`,

    // Drop Zone
    drop_title: 'Перетягніть відео або аудіо файл сюди',
    drop_btn_select: 'Вибрати файл на диску',
    drop_analyzing: 'Аналіз файлу...',
    file_size_label: 'Розмір:',
    file_duration_label: 'Тривалість:',
    file_mono_info: '16 кГц моно',
    btn_remove_file_title: 'Вибрати інший файл',

    // Media Player
    media_player_title: 'Медіаплеєр та форма хвилі',
    player_play_pause: 'Відтворення / Пауза',
    player_backward_title: 'Назад на 5 секунд',
    player_forward_title: 'Вперед на 5 секунд',
    player_backward_text: '-5с',
    player_forward_text: '+5с',

    // Whisper Inference Parameters
    config_title: 'Параметри інференсу Whisper',
    label_model: 'Модель Whisper',
    label_acceleration: 'Прискорення',
    label_precision: 'Точність ваг',
    label_threads: 'Навантаження CPU',
    label_language: 'Мова мовлення',
    label_task: 'Завдання',
    label_timestamps: 'Таймкоди',
    check_timestamps_label: 'Генерувати субтитри',

    // Cache & Pre-download
    cache_in_cache: '✓ У кеші',
    cache_not_cached: '☁ Не завантажено',
    btn_preload_model: 'Завантажити в кеш',
    btn_preload_downloading: 'Завантаження...',
    btn_preload_ready: '✓ У кеші',
    toast_preload_started: 'Завантаження ваг моделі в кеш браузера...',
    toast_preload_done: 'Модель успішно збережена в кеш браузера!',

    // Options for Device
    device_auto: '🤖 Авто (WebGPU / WASM)',
    device_webgpu: '⚡ WebGPU (iGPU / Графіка)',
    device_wasm: '💻 CPU (WASM SIMD багатопотік)',

    // Options for Precision
    precision_max: '💎 Максимальна (Без втрат: FP16 GPU / FP32 CPU)',
    precision_eco: '⚡ Економічна (Q4 / INT8 стиснення)',

    // Options for Task
    task_transcribe: '📝 Транскрибація (мовою оригіналу)',
    task_translate: '🌐 Переклад на англійську',

    // Buttons
    btn_transcribe: 'Запустити транскрибацію',
    btn_cancel: 'Зупинити',

    // Progress Stages
    stage_model_loading: 'Завантаження моделі',
    stage_weights_download: 'Завантаження ваг ONNX',
    stage_inference: 'Інференс Whisper',
    stage_transcribe: 'Транскрибація',
    stage_audio_prep: 'Підготовка звуку',
    stage_init: 'Ініціалізація',
    progress_initializing: 'Ініціалізація...',
    progress_stopping: 'Зупинка транскрибації...',
    progress_model_ready: (device, threads) => `Модель готова (${device}${threads}). Починаємо розпізнавання...`,

    // Transcription Studio
    studio_title: 'Студія розшифровки',
    stat_duration: 'Тривалість:',
    stat_words: 'Слів:',
    stat_segments: 'Фраз:',
    search_placeholder: 'Пошук по фразах...',
    search_clear_title: 'Очистити пошук',
    tab_subtitles: 'Субтитри',
    tab_article: 'Текст',
    btn_copy: 'Скопіювати',
    btn_copied: 'Скопійовано!',
    btn_download_txt: 'Зберегти .TXT',
    btn_download_txt_title: 'Зберегти файл .txt поруч із вхідним файлом',
    seek_phrase_title: 'Перемотати плеєр на цю фразу',

    // Empty State
    empty_title: "Тут з'явиться готовий текст",
    empty_desc: 'Перетягніть відео або аудіо файл у панель зліва та натисніть «Запустити транскрибацію». Модель Whisper автоматично розпізнає мову та розставить точні таймкоди.',
    feat_privacy: '🔒 100% Приватно (дані не йдуть в мережу)',
    feat_hardware: '⚡ Апаратний інференс у браузері',
    feat_seek: '🎯 Клік на фразу перемикає плеєр',
    article_placeholder: 'Тут відображатиметься суцільний редагований текст...',

    // Modal
    modal_title: 'Запуск на Linux та Windows (Без sudo)',
    modal_sec1_title: '1. Чистий Linux без sudo та без встановлення програм',
    modal_sec1_desc: 'У проєкт уже вбудовано автономний статичний сервер bin/server-linux (musl libc). Йому не потрібні права root / sudo, не потрібен Node.js, Python чи сторонні бібліотеки!',
    modal_sec1_cmd_label: 'На чистому Linux достатньо запустити:',
    modal_sec2_title: '2. Запуск на Windows',
    modal_sec2_desc: 'Для Windows у проєкт вбудовано bin/server-windows.exe. Просто двічі клікніть файл:',
    modal_sec2_note: 'Браузер відкриється автоматично за адресою http://localhost:8080.',
    modal_sec3_title: '3. Увімкнення WebGPU / NPU на Linux',
    modal_sec3_desc: 'У Chrome / Chromium на Linux увімкніть апаратне прискорення для максимальної швидкості:',
    modal_sec3_note: 'Якщо WebGPU не активовано, модель автоматично працюватиме на всіх ядрах процесора через WASM SIMD.',
    modal_btn_close: 'Зрозуміло',

    // Toasts
    toast_audio_extracting: (size) => `Вилучення аудіодоріжки (${size})...`,
    toast_audio_ready: 'Аудіодоріжку підготовлено! Готово до розпізнавання.',
    toast_audio_error: (err) => `Помилка декодування аудіо: ${err}`,
    toast_transcribe_done: 'Транскрибацію успішно завершено!',
    toast_transcribe_cancelled: 'Транскрибацію зупинено користувачем.',
    toast_copy_empty: 'Немає тексту для копіювання',
    toast_copy_success: 'Весь текст скопійовано в буфер обміну!',
    toast_copy_error: 'Не вдалося скопіювати текст у буфер',
    toast_save_empty: 'Немає тексту для збереження',
    toast_file_saved: (name) => `Файл «${name}» успішно збережено!`,

    // Helper formatting
    coresCount: (n) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${n} ядер`;
      if (mod10 === 1) return `${n} ядро`;
      if (mod10 >= 2 && mod10 <= 4) return `${n} ядра`;
      return `${n} ядер`;
    },

    // Spoken languages options
    languages: {
      auto: '🌐 Автовизначення (Усі мови)',
      uk: '🇺🇦 Українська',
      en: '🇬🇧 Англійська',
      ru: '🇷🇺 Російська',
      be: '🇧🇾 Білоруська',
      kk: '🇰🇿 Казахська',
      de: '🇩🇪 Німецька',
      fr: '🇫🇷 Французька',
      es: '🇪🇸 Іспанська',
      it: '🇮🇹 Італійська',
      pl: '🇵🇱 Польська',
      pt: '🇵🇹 Португальська',
      tr: '🇹🇷 Турецька',
      zh: '🇨🇳 Китайська',
      ja: '🇯🇵 Японська',
      ko: '🇰🇷 Корейська',
      ar: '🇸🇦 Арабська',
      hi: '🇮🇳 Гінді',
      nl: '🇳🇱 Нідерландська',
      sv: '🇸🇪 Шведська',
      cs: '🇨🇿 Чеська',
      ro: '🇷🇴 Румунська',
    },
  },

  en: {
    // App & Header
    app_title: 'TransGribator — Local Whisper Transcription (NPU / CPU / WebGPU)',
    app_meta_desc: 'Lightweight in-browser speech transcription powered by Whisper and ONNX Web. 100% private, zero server uploads, NPU / CPU / WebGPU acceleration.',
    brand_tagline: 'Whisper In-Browser • 100% Local • NPU / CPU / WebGPU',
    btn_linux: 'Run on Linux',
    theme_toggle_title: 'Toggle Color Theme (Dark / Light)',
    lang_toggle_title: 'Change Interface Language',

    // Status Pills in Header
    os_status_init: 'Detecting OS...',
    gpu_status_init: 'Initializing...',
    gpu_webgpu_prefix: '⚡ WebGPU:',
    gpu_cpu_prefix: '💻 CPU (WASM SIMD):',

    // Hardware Strip
    hw_backend_title: 'Hardware Backend',
    hw_gpu_title: 'Graphics Accelerator (GPU / NPU)',
    hw_os_title: 'Operating System',
    hw_cpu_title: 'CPU Cores',
    hw_webgpu_badge: 'WebGPU',
    hw_wasm_badge: 'WASM SIMD',
    hw_detecting: 'Detecting...',
    hw_cpu_cores: (n) => `${n} CPU cores`,

    // Drop Zone
    drop_title: 'Drag & drop video or audio file here',
    drop_btn_select: 'Browse file on disk',
    drop_analyzing: 'Analyzing file...',
    file_size_label: 'Size:',
    file_duration_label: 'Duration:',
    file_mono_info: '16 kHz mono',
    btn_remove_file_title: 'Select another file',

    // Media Player
    media_player_title: 'Media Player & Waveform',
    player_play_pause: 'Play / Pause',
    player_backward_title: 'Back 5 seconds',
    player_forward_title: 'Forward 5 seconds',
    player_backward_text: '-5s',
    player_forward_text: '+5s',

    // Whisper Inference Parameters
    config_title: 'Whisper Inference Settings',
    label_model: 'Whisper Model',
    label_acceleration: 'Acceleration',
    label_precision: 'Weight Precision',
    label_threads: 'CPU Load',
    label_language: 'Spoken Language',
    label_task: 'Task',
    label_timestamps: 'Timestamps',
    check_timestamps_label: 'Generate subtitles',

    // Cache & Pre-download
    cache_in_cache: '✓ In Cache',
    cache_not_cached: '☁ Not Cached',
    btn_preload_model: 'Preload to Cache',
    btn_preload_downloading: 'Downloading...',
    btn_preload_ready: '✓ In Cache',
    toast_preload_started: 'Downloading model weights into browser cache...',
    toast_preload_done: 'Model successfully cached in browser storage!',

    // Options for Device
    device_auto: '🤖 Auto (WebGPU / WASM)',
    device_webgpu: '⚡ WebGPU (iGPU / Graphics)',
    device_wasm: '💻 CPU (WASM SIMD Multi-thread)',

    // Options for Precision
    precision_max: '💎 Maximum (Lossless: FP16 GPU / FP32 CPU)',
    precision_eco: '⚡ Economical (Q4 / INT8 compression)',

    // Options for Task
    task_transcribe: '📝 Transcribe (Original language)',
    task_translate: '🌐 Translate to English',

    // Buttons
    btn_transcribe: 'Start Transcription',
    btn_cancel: 'Stop',

    // Progress Stages
    stage_model_loading: 'Loading Model',
    stage_weights_download: 'Downloading ONNX Weights',
    stage_inference: 'Whisper Inference',
    stage_transcribe: 'Transcribing',
    stage_audio_prep: 'Audio Prep',
    stage_init: 'Initialization',
    progress_initializing: 'Initializing...',
    progress_stopping: 'Stopping transcription...',
    progress_model_ready: (device, threads) => `Model ready (${device}${threads}). Starting recognition...`,

    // Transcription Studio
    studio_title: 'Transcription Studio',
    stat_duration: 'Duration:',
    stat_words: 'Words:',
    stat_segments: 'Phrases:',
    search_placeholder: 'Search phrases...',
    search_clear_title: 'Clear search',
    tab_subtitles: 'Subtitles',
    tab_article: 'Text',
    btn_copy: 'Copy',
    btn_copied: 'Copied!',
    btn_download_txt: 'Save .TXT',
    btn_download_txt_title: 'Save .txt file next to source media',
    seek_phrase_title: 'Seek media player to this phrase',

    // Empty State
    empty_title: 'Ready text will appear here',
    empty_desc: 'Drag & drop a video or audio file into the left panel and click "Start Transcription". Whisper will automatically recognize speech and insert accurate timestamps.',
    feat_privacy: '🔒 100% Private (no data leaves your machine)',
    feat_hardware: '⚡ Hardware inference in-browser',
    feat_seek: '🎯 Click phrase to seek playback',
    article_placeholder: 'Continuous editable text will be displayed here...',

    // Modal
    modal_title: 'Run on Linux and Windows (No sudo)',
    modal_sec1_title: '1. Clean Linux without sudo or installs',
    modal_sec1_desc: 'Built-in standalone static server bin/server-linux (musl libc). Requires no root/sudo, Node.js, Python, or external dependencies!',
    modal_sec1_cmd_label: 'On clean Linux simply run:',
    modal_sec2_title: '2. Run on Windows',
    modal_sec2_desc: 'For Windows, bin/server-windows.exe is included. Just double click:',
    modal_sec2_note: 'Browser opens automatically at http://localhost:8080.',
    modal_sec3_title: '3. Enable WebGPU / NPU on Linux',
    modal_sec3_desc: 'In Chrome / Chromium on Linux enable hardware flags for maximum performance:',
    modal_sec3_note: 'If WebGPU is not available, model will automatically run multi-threaded on CPU via WASM SIMD.',
    modal_btn_close: 'Got it',

    // Toasts
    toast_audio_extracting: (size) => `Extracting audio stream (${size})...`,
    toast_audio_ready: 'Audio stream prepared! Ready for transcription.',
    toast_audio_error: (err) => `Audio decode error: ${err}`,
    toast_transcribe_done: 'Transcription completed successfully!',
    toast_transcribe_cancelled: 'Transcription cancelled by user.',
    toast_copy_empty: 'No text to copy',
    toast_copy_success: 'All text copied to clipboard!',
    toast_copy_error: 'Failed to copy text to clipboard',
    toast_save_empty: 'No text to save',
    toast_file_saved: (name) => `File "${name}" saved successfully!`,

    // Helper formatting
    coresCount: (n) => `${n} cores`,

    // Spoken languages options
    languages: {
      auto: '🌐 Auto-detect (All languages)',
      uk: '🇺🇦 Ukrainian',
      en: '🇬🇧 English',
      ru: '🇷🇺 Russian',
      be: '🇧🇾 Belarusian',
      kk: '🇰🇿 Kazakh',
      de: '🇩🇪 German',
      fr: '🇫🇷 French',
      es: '🇪🇸 Spanish',
      it: '🇮🇹 Italian',
      pl: '🇵🇱 Polish',
      pt: '🇵🇹 Portuguese',
      tr: '🇹🇷 Turkish',
      zh: '🇨🇳 Chinese',
      ja: '🇯🇵 Japanese',
      ko: '🇰🇷 Korean',
      ar: '🇸🇦 Arabic',
      hi: '🇮🇳 Hindi',
      nl: '🇳🇱 Dutch',
      sv: '🇸🇪 Swedish',
      cs: '🇨🇿 Czech',
      ro: '🇷🇴 Romanian',
    },
  },
};
