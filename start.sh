#!/usr/bin/env bash
# TransGribator All-in-One Launcher for Linux
# Works on clean Linux with NO sudo, NO python, NO node!

cd "$(dirname "$0")" || exit 1
PORT=8080

echo "======================================================="
echo "  🚀 TransGribator Studio — Запуск на Linux"
echo "======================================================="

# Helper to open browser in background
open_browser() {
    sleep 1
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:${PORT}" >/dev/null 2>&1 &
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "http://localhost:${PORT}" >/dev/null 2>&1 &
    fi
}

# 1. Try standalone static binary (No dependencies, No sudo required)
if [ -f "./bin/server-linux" ]; then
    chmod +x "./bin/server-linux" 2>/dev/null
    if ./bin/server-linux --version >/dev/null 2>&1; then
        echo "[1/3] Запуск через встроенный бинарный сервер (без зависимостей)..."
        echo "🌐 Адрес: http://localhost:${PORT}"
        open_browser
        exec ./bin/server-linux -w ./sws.toml
    fi
fi

# 2. Try Node.js if present
if command -v node >/dev/null 2>&1; then
    echo "[2/3] Запуск через Node.js..."
    echo "🌐 Адрес: http://localhost:${PORT}"
    open_browser
    exec node serve.js
fi

# 3. Try Python 3 if present
if command -v python3 >/dev/null 2>&1; then
    echo "[3/3] Запуск через системный Python 3..."
    echo "🌐 Адрес: http://localhost:${PORT}"
    open_browser
    exec python3 server.py
fi

# 4. Try generic python
if command -v python >/dev/null 2>&1; then
    echo "[4/4] Запуск через Python..."
    echo "🌐 Адрес: http://localhost:${PORT}"
    open_browser
    exec python server.py
fi

echo ""
echo "❌ Ошибка: Не удалось запустить локальный сервер."
echo "Убедитесь, что файл bin/server-linux имеет права на запуск (chmod +x bin/server-linux)"
echo "или на машине установлен python3."
exit 1
