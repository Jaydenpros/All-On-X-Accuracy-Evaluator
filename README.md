# OnXTrue STL Viewer

OnXTrue is a local Flask + Three.js application for dental All-on-X STL workflows. It loads scan body libraries and full-arch scans, isolates scanbodies, registers library copies, visualizes deviation, exports transformation matrices, and supports accuracy/trueness assessment from JSON matrix files.

## Features

- Load ASCII or binary STL files in a local 3D workspace.
- Use orbit, zoom, pan, fit view, reset view, wireframe, and grid controls.
- Show/hide individual objects or grouped scanbodies in the 3D Objects panel.
- Hover over a visible mesh to show its object name near the cursor.
- Display local XYZ origin axes on library-derived meshes.
- Validate and store STL uploads through the Flask backend.

## Data Processing workflow

1. Import one scan body library STL.
2. Import one or more full-arch scan STLs.
3. Run **Isolate Scanbodies** to split full-arch scans into scanbody objects.
4. Run **1 Initial Alignment** to create a registered library copy for each isolated scanbody.
5. Run **2 ICP & Deviation** to refine rigid registration and color scanbody deviation.
6. Run **3 Plane Refinement** to refine top/side plane alignment.
7. After plane refinement, isolated scanbodies are renamed by virtual arch sequence:

   ```text
   FullArchName_SB1.stl
   FullArchName_SB2.stl
   ...
   FullArchName_SBn.stl
   ```

   The renaming uses registered library-copy positions and orientations. It does not move meshes or change registration matrices.

8. Open **Matrices** to review or export the 4×4 registration matrices.

## Accuracy Assessment workflow

1. Import an assessment library STL.
2. Import reference transformation JSON files.
3. Add one or more test groups and import test transformation JSON files.
4. Use **Trueness measurement** to rigidly register each test full-arch scan to the reference scan.

Trueness measurement uses ordered scanbody matrix landmarks and a Kabsch-style rigid transform. The full-arch test scan moves as one rigid object; scanbody-to-scanbody relationships inside the scan are preserved.

Expected scanbody matrix field:

```text
matrix_4x4_row_major
```

## Run locally

Create a virtual environment and install the Flask dependency:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Preferred development command:

```bash
.venv/bin/flask --app app run --host 127.0.0.1 --port 5001 --no-debugger --no-reload
```

Open:

```text
http://127.0.0.1:5001/
```

`python app.py` also works and defaults to port `5000`, but port `5000` may be occupied by macOS services. The Codex workflow prefers `5001`.

The application uses bundled Three.js assets and can run without an internet connection.

## Development checks

For JavaScript changes:

```bash
/Users/Jaden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check static/app.js
git diff --check
```

When changing `static/app.js` or `static/styles.css`, bump the matching `v=` query parameter in `templates/index.html` so the browser does not use stale cached assets.

## Build the macOS application

The desktop build stores working files in:

```text
~/Library/Application Support/OnXTrue
```

Install packaging dependencies and build the app:

```bash
python3 -m venv .venv-macos
source .venv-macos/bin/activate
pip install -r requirements-macos.txt
chmod +x build_macos.sh
./build_macos.sh
```

The architecture-specific installer image is created in `dist/`. The default build is ad-hoc signed for local testing. Distribution to other Macs without security warnings requires an Apple Developer ID certificate and notarization.

## Rebuild the application guide

The generated Word guide is stored in `outputs/`. To rebuild it:

```bash
pip install -r requirements-docs.txt
python work/build_application_guide.py
```

To include a screenshot, set `ONXTRUE_GUIDE_SCREENSHOT` to the image path before running the script.
