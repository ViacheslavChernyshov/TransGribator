# TransGribator 🍄 — Локальна студія транскрибації мовлення (Whisper AI)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e?style=flat&logo=github)](https://viacheslavchernyshov.github.io/TransGribator/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Browser%20(ONNX%20Web)-8b5cf6)](https://github.com/huggingface/transformers.js)
[![Acceleration](https://img.shields.io/badge/Acceleration-WebGPU%20%7C%20WASM%20SIMD-06b6d4)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Offline-10b981)](#-100-приватність-та-робота-офлайн)

🌐 **Спробувати онлайн прямо зараз:** **[https://viacheslavchernyshov.github.io/TransGribator/](https://viacheslavchernyshov.github.io/TransGribator/)**

**TransGribator** — ультрашвидка автономна студія транскрибації аудіо та відео на базі моделей сімейства **OpenAI Whisper** (Large-v3-Turbo, Large-v3, Small, Base, Tiny), яка повністю виконується **всередині веб-браузера** за допомогою **Transformers.js v3** та **ONNX Runtime Web**.

Жодного PyTorch, жодних залежностей від зовнішніх хмарних API, жодних витоків даних — 100% обчислень виконуються на вашому власному залізі.

---

## ⚡ Ключові можливості

- **🚀 Апаратне прискорення:**
  - **WebGPU:** Пряма утилізація відеокарт (NVIDIA, AMD, Apple Silicon) та вбудованої графіки (Intel Iris Xe, AMD Radeon 780M).
  - **CPU (WASM SIMD):** Багатопотоковий WebAssembly із векторними інструкціями SIMD для максимальної швидкості на будь-якому процесорі.
- **🎧 Пряме декодування Web Audio API:**
  - Будь-які відео- та аудіоформати (`.mp4`, `.webm`, `.mkv`, `.avi`, `.mov`, `.mp3`, `.wav`, `.m4a`, `.aac`, `.flac`, `.ogg`) апаратно конвертуються у 16 кГц моно Float32 прямо в оперативній пам'яті.
- **🎛️ Ергономічна студія на 1 екран (No-Scroll Layout):**
  - Верхня діагностична панель: реальний статус WebGPU, модель відеокарти/NPU, ОС та кількість процесорних ядер.
  - Ліва панель керування: компактне поле вкидання файлів, відеоплеєр та форма хвилі, параметри моделі та вибору ядер.
  - Права робоча область: субтитри з клікабельними таймкодами (клік на фразу миттєво перемотує плеєр), швидкий пошук, режим суцільного тексту та експорт.
- **🔒 100% Приватність та офлайн:**
  - Ваші файли ніколи не передаються в інтернет.
  - Веси моделей кешуються у браузері (`CacheStorage` / `IndexedDB`) — після першого завантаження інтернет не потрібен.
- **🌐 Двомовний інтерфейс:** Повна підтримка української (`UA`) та англійської (`EN`) мов із перемиканням на льоту.

---

## 📁 Структура проєкту

```text
TransGribator/
├── bin/
│   ├── server-linux        # Автономний статичний сервер для Linux (musl libc, без залежностей)
│   └── server-windows.exe  # Автономний сервер для Windows
├── dist/                   # Зібраний SPA-клієнт (HTML, JS, CSS, Web Worker, WASM SIMD)
├── public/
│   └── favicon.svg         # Іконка проєкту
├── src/
│   ├── audio.js            # Web Audio API декодер та генератор хвильової форми
│   ├── i18n.js             # Модуль локалізації (UA / EN)
│   ├── main.js             # Основний контролер інтерфейсу та взаємодії
│   ├── style.css           # Преміальна темна та світла дизайн-система
│   ├── utils.js            # Експорт субтитрів (TXT, SRT, VTT, JSON) та утиліти
│   └── worker.js           # Web Worker для фонового інференсу Whisper ONNX
├── index.html              # Головна точка входу додатку
├── serve.js                # Резервний HTTP-сервер Node.js із заголовками COOP/COEP
├── server.py               # Резервний HTTP-сервер Python 3 (стандартна бібліотека)
├── start.bat               # Лаунчер в 1 клік для Windows
├── start.sh                # Лаунчер в 1 клік для Linux (без sudo)
├── sws.toml                # Конфігурація заголовків COOP/COEP для WebAssembly SIMD
└── package.json            # Залежності та скрипти збірки
```

---

## 🚀 Швидкий запуск

### Варіант 1. Автономний запуск без Node.js та без встановлення програм

#### 🪟 Windows:
Двічі клікніть по файлу:
```cmd
start.bat
```
Скрипт запустить вбудований `bin/server-windows.exe` та відкриє браузер за адресою `http://localhost:8080`.

#### 🐧 Linux (без sudo):
```bash
chmod +x start.sh bin/server-linux
./start.sh
```
Запуститься легкий musl-бінарник `bin/server-linux`, який працює на будь-якому дистрибутиві Linux без прав root.

---

### Варіант 2. Розробка та складання з вихідного коду (Node.js)

1. **Встановіть залежності:**
   ```bash
   npm install
   ```

2. **Запустіть режим розробки (Vite):**
   ```bash
   npm run dev
   ```

3. **Зберіть оптимізований production-бандл:**
   ```bash
   npm run build
   ```

4. **Запустіть статичний сервер:**
   ```bash
   npm run start
   # або: node serve.js
   # або: python3 server.py
   ```

---

## 💡 Увімкнення апаратного прискорення WebGPU

Якщо ваш браузер на базі Chromium (Google Chrome, Microsoft Edge, Brave) ще не увімкнув WebGPU за замовчуванням:

1. Перейдіть у `chrome://flags/#enable-unsafe-webgpu` та встановіть **Enabled**.
2. Перейдіть у `chrome://flags/#enable-vulkan` та встановіть **Enabled** (для Linux).
3. Перезапустіть браузер.

> **Примітка:** Якщо WebGPU недоступний на системі, TransGribator автоматично перемикається на всі ядра вашого процесора через векторний багатопотоковий **WASM SIMD**.

---

## 📄 Ліцензія

Цей проєкт поширюється за ліцензією [MIT](LICENSE).
