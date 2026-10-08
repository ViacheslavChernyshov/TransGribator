#!/usr/bin/env python3
"""
TransGribator Portable Static Server (Python 3 Standard Library only)
Sets COOP/COEP headers for multithreaded WASM and WebGPU.
Zero external dependencies, no pip, no sudo required.
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')

class SecureHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def end_headers(self):
        # Security headers required for SharedArrayBuffer & multi-threaded WASM SIMD
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def do_GET(self):
        # Fallback to index.html for SPA if file does not exist
        requested_path = self.translate_path(self.path)
        if not os.path.exists(requested_path) or os.path.isdir(requested_path):
            index_path = os.path.join(DIST_DIR, 'index.html')
            if not os.path.exists(requested_path) and os.path.exists(index_path):
                self.path = '/index.html'
        return super().do_GET()

def run():
    if not os.path.exists(DIST_DIR):
        print(f"Ошибка: Директория {DIST_DIR} не найдена. Сначала выполните сборку проекта.")
        sys.exit(1)

    server = HTTPServer(('0.0.0.0', PORT), SecureHandler)
    print("\n" + "=" * 54)
    print(f"  🚀 TransGribator Studio запущен (Python Server)!")
    print(f"  🌐 Откройте в браузере: http://localhost:{PORT}")
    print(f"  ⚡ Поддержка WebGPU / WASM SIMD активна")
    print("=" * 54 + "\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
        server.server_close()

if __name__ == '__main__':
    run()
