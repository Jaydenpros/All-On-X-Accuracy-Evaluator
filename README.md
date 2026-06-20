# FormSpace STL Viewer

A Python/Flask web application for uploading and interactively viewing multiple ASCII or binary STL files in one 3D scene.

## Features

- Upload or drag and drop multiple STL files
- Orbit, zoom, and pan around the 3D scene
- Automatically arrange models side by side
- Fit all visible models to the camera
- Toggle wireframe and grid views
- Show, hide, or remove individual models
- Display triangle count, model dimensions, and file sizes
- Validate and store STL files through a Python backend

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

Three.js is loaded from jsDelivr, so the browser needs an internet connection when the app starts.

## Rebuild the application guide

The generated Word guide is stored in `outputs/`. To rebuild it:

```bash
pip install -r requirements-docs.txt
python work/build_application_guide.py
```

To include a screenshot, set `FORMSPACE_GUIDE_SCREENSHOT` to the image path before running the script.
