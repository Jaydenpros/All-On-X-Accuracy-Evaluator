from __future__ import annotations

import os
import struct
import uuid
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_from_directory
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024


def looks_like_stl(path: Path) -> bool:
    """Perform a lightweight check for either binary or ASCII STL data."""
    size = path.stat().st_size
    if size < 15:
        return False

    with path.open("rb") as file:
        sample = file.read(4096)

    if len(sample) >= 84:
        triangle_count = struct.unpack("<I", sample[80:84])[0]
        if 84 + triangle_count * 50 == size:
            return True

    prefix = sample.lstrip().lower()
    return prefix.startswith(b"solid") and b"facet" in prefix


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/upload")
def upload_files():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No STL files were provided."}), 400

    uploaded = []
    rejected = []

    for uploaded_file in files:
        original_name = uploaded_file.filename or "unnamed.stl"
        safe_name = secure_filename(original_name)

        if not safe_name.lower().endswith(".stl"):
            rejected.append({"name": original_name, "reason": "File must use the .stl extension."})
            continue

        stored_name = f"{uuid.uuid4().hex}_{safe_name}"
        destination = UPLOAD_DIR / stored_name
        uploaded_file.save(destination)

        if not looks_like_stl(destination):
            destination.unlink(missing_ok=True)
            rejected.append({"name": original_name, "reason": "The file does not appear to be valid STL data."})
            continue

        uploaded.append(
            {
                "id": uuid.uuid4().hex,
                "name": original_name,
                "size": destination.stat().st_size,
                "url": f"/uploads/{stored_name}",
            }
        )

    status = 200 if uploaded else 400
    return jsonify({"files": uploaded, "rejected": rejected}), status


@app.get("/uploads/<path:filename>")
def uploaded_file(filename: str):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Upload is too large. The combined limit is 500 MB."}), 413


if __name__ == "__main__":
    app.run(host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "5000")), debug=True)
