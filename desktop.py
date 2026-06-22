from __future__ import annotations

import atexit
import os
import socket
import threading
from pathlib import Path

import webview
from werkzeug.serving import make_server


APP_NAME = "OnXTrue"


def user_data_dir() -> Path:
    return Path.home() / "Library" / "Application Support" / APP_NAME


def available_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def main() -> None:
    data_dir = user_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)
    os.environ["ONXTRUE_DATA_DIR"] = str(data_dir)

    from app import app

    port = available_port()
    server = make_server("127.0.0.1", port, app, threaded=True)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    atexit.register(server.shutdown)

    webview.create_window(
        APP_NAME,
        f"http://127.0.0.1:{port}",
        width=1440,
        height=900,
        min_size=(1000, 700),
        background_color="#0d0e0e",
    )
    try:
        webview.start()
    finally:
        server.shutdown()
        server_thread.join(timeout=2)


if __name__ == "__main__":
    main()
