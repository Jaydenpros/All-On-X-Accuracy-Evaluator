# OnXTrue Project Map for Agents

Use this file first. For deeper selector/function details, read `.agents/app-map.md`.

## What this project is

OnXTrue is a local Flask + Three.js application for dental All-on-X STL workflows:

- load one scan body library STL and multiple full-arch scan STLs;
- isolate scanbodies from full-arch scans;
- rigidly register library copies to scanbodies;
- show deviation maps and export registration matrices;
- reconstruct accuracy-assessment scanbodies from transformation JSON;
- run trueness measurement by rigidly registering each test full-arch scan to reference data.

The front end is currently a single-page app. Most behavior lives in one large file: `static/app.js`.

## Read these first

| File | Purpose |
| --- | --- |
| `templates/index.html` | All DOM structure: module tabs, sidebars, toolbar, viewer, object panel, stats, matrix modal. |
| `static/app.js` | Three.js scene, state maps, STL parsing, isolation, registration, assessment/trueness logic, UI event wiring. |
| `static/styles.css` | Entire visual system and responsive layout. |
| `app.py` | Flask server, upload validation, upload storage, static upload serving. |
| `.agents/app-map.md` | More detailed map of important selectors, functions, state, and workflows. |

## Usually skip unless relevant

- `.venv/`, `.venv-macos/` — local Python environments.
- `build/`, `dist/`, `OnXTrue.spec` — generated/packaging outputs; inspect only for desktop-build work.
- `uploads/` — runtime STL uploads; binary data, not app source.
- `static/vendor/three/` — vendored Three.js, OrbitControls, and STLLoader. Do not edit unless updating vendor dependencies.
- `outputs/*.docx` — generated Word guide.
- `.git/`, `__pycache__/`, `.DS_Store` — metadata/cache.

## Runtime

Preferred local dev URL:

```bash
http://127.0.0.1:5001/
```

Preferred dev server command:

```bash
.venv/bin/flask --app app run --host 127.0.0.1 --port 5001 --no-debugger --no-reload
```

`app.py` defaults to port `5000` when run directly, but port 5000 may be occupied by macOS/AirPlay or stale browser state. The Codex workflow uses `5001`.

Quick verification:

```bash
/Users/Jaden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check static/app.js
git diff --check
curl -sS http://127.0.0.1:5001/
```

If changing `static/app.js` or `static/styles.css`, bump the matching `v=` query in `templates/index.html`.

## Backend map

`app.py`

- `application_data_dir()` uses `ONXTRUE_DATA_DIR` or the repo root.
- `UPLOAD_DIR` is `DATA_DIR / "uploads"`.
- `MAX_CONTENT_LENGTH` is 500 MB.
- `looks_like_stl(path)` accepts binary STL by exact triangle-count size or ASCII STL by `solid` + `facet`.
- `GET /` renders `templates/index.html`.
- `POST /api/upload` accepts multipart `files`, requires `.stl`, stores UUID-prefixed files, validates STL, returns `{files, rejected}`.
- `GET /uploads/<filename>` serves uploaded STLs.
- `413` returns JSON for oversized uploads.

`desktop.py`

- Desktop wrapper using `pywebview`.
- Sets `ONXTRUE_DATA_DIR` to `~/Library/Application Support/OnXTrue`.
- Starts Flask on an OS-selected free localhost port with `make_server`.
- Opens a 1440 × 900 desktop window.

## Front-end structure

`templates/index.html` contains three modules:

- Data Processing sidebar:
  - `#library-input`, `#library-drop-zone`, `#library-list`
  - `#scans-input`, `#scans-drop-zone`, `#scans-list`
  - `#clear-scans`
- Accuracy Assessment sidebar:
  - `#assessment-library-input`, `#assessment-library-zone`
  - `#reference-json-input`, `#reference-json-zone`
  - `#reference-group-color`
  - `#test-groups-container`, `#add-test-group`
  - `#clear-assessment`
- Report sidebar:
  - `#report-sidebar`
  - `#report-sidebar-summary`
- Shared viewport/toolbar:
  - `#scene-canvas`
  - `#object-hover-label`
  - `#fit-view`, `#reset-view`, `#center-library`
  - `#isolate-scanbodies`
  - `#feature-detect`
  - `#crop-scanbodies`
  - `#register-scanbodies`
  - `#refine-registration`
  - `#plane-refinement`
  - `#show-registration-matrices`
  - `#deviation-color-map-toggle`
  - `#initial-assessment-alignment` labeled `1 Initial Alignment`
  - `#refined-assessment-alignment` labeled `2 Refined Alignment`
  - `#show-assessment-alignment-report`
  - `#assessment-registration-status`
  - `#wireframe-toggle`, `#grid-toggle`, `#feature-seed-arrows-toggle`
  - `#objects-panel`, `#data-objects-list`, `#assessment-objects-list`
  - `#deviation-legend`
  - `#registration-matrix-window`
- Report viewport:
  - `#report-panel`
  - `#report-summary-cards`
  - `#report-content`

`switchModule(moduleName)` in `static/app.js` toggles the sidebars, scene roots, object lists, report panel, and module-specific toolbar controls.

## Front-end state and scene roots

Shared Three.js objects in `static/app.js`:

- `scene`, `camera`, `renderer`, `controls`
- `grid`
- `modelsGroup` for Data Processing
- `assessmentGroup` for Accuracy Assessment
- `loader = new STLLoader()`

Data Processing state:

- `models: Map<id, entry>`
- `scanGroups: Map<id, group>`

Accuracy Assessment state:

- `assessmentModels: Map<id, entry>`
- `assessmentScanGroups: Map<id, group>`
- `assessmentDataGroups: Map<id, dataset>`
- `assessmentLibrary`
- `nextAssessmentTestGroup`

Important entry/model types:

- `library` — uploaded library STL.
- `scan` — full-arch scan or isolated scanbody.
- `registered` — transformed library copy.
- `assessment-library` — assessment library at native origin.
- `assessment-scanbody` — assessment library clone transformed from JSON.

## Major workflows in `static/app.js`

STL loading:

- `parseBinarySTL()`, `fetchSTLGeometry()`, `parseSTLFile()`
- `uploadFiles()` posts to `/api/upload`.
- `loadUploadedModel()` fetches uploaded STL geometry and calls `addModelFromGeometry()`.

Scene/UI:

- `updateUI()`, `updateAssessmentUI()`
- `updateSceneReference()`, `fitView()`, `centerLibraryView()`
- `createModelRow()`, `createObjectRow()`, `createScanGroup()`
- visibility helpers for individual models, scan groups, assessment groups, and datasets.

Scanbody isolation:

- `isolateGeometry()` splits connected triangle components.
- `groupNearbyComponents(..., distance = 2)` merges components within 2 mm.
- `filterSmallComponents(..., minimumDimension = 3)` removes merged components whose largest bounding-box dimension is under 3 mm.
- `mergeGeometries()` combines grouped components.
- `isolateScanbodies()` replaces full-arch scans with isolated `SB1`, `SB2`, etc. children.
- `cropScanbodies()` crops isolated scanbodies to triangles within 4.6 mm of the detected top-ring plane, then runs Feature Detect again.

Registration/deviation:

- `sampleGeometryPoints()`, `buildKdTree()`, `nearestPoint()`
- `bestRigidTransform()` computes rigid transform from paired points.
- `detectPlanarPatches()`, `classifyFeaturePlanes()`, `planePatchShapeMetrics()`
- `prepareFeatureRegistration()` creates initial candidates from detected long axis, top-ring plane, and side plane only.
- `refineRegistration()` runs ICP.
- `registerIsolatedScanbodies()` creates initial registered library copies.
- `refineInitialRegistrations()` runs ICP and deviation mapping.
- `planeRefinementMatrix()` / `refineRegistrationPlanes()` perform top/side plane refinement.
- After initial alignment and again after plane refinement, `renameRegisteredScanbodySequences()` renames isolated scanbodies as `FullArch_SB1.stl`, `FullArch_SB2.stl`, etc. using virtual arch sequencing from registered library-copy positions/orientations; it does not move meshes or change matrices.
- `colorizeDeviationEntry()`, `setDeviationScale()`, `applyDeviationMap()`, `applyDeviationColorMapVisibility()` handle deviation colors and the color-map display toggle.
- `renderRegistrationMatrices()`, `registrationExportData()`, `exportRegistrationMatrices()` handle matrix modal/export from initial, ICP, and plane-refined stages; the open modal refreshes after each stage.

Accuracy Assessment:

- `normalizedAssessmentScans()` parses accepted JSON structures.
- Expected scanbody matrix field: `matrix_4x4_row_major`.
- `initializeAssessmentDataGroups()` creates reference + first test group.
- `importAssessmentLibrary()` imports the library STL.
- `importAssessmentJsonFiles()` imports reference/test JSON files.
- Test groups auto-name from the first imported JSON filename until the user manually edits the group name.
- `rebuildAssessmentScene()` clones the assessment library for each scanbody matrix.
- `setAssessmentDataGroupColor()` updates reference/test colors.

Accuracy Assessment alignment:

- UI: `#initial-assessment-alignment`, `#refined-assessment-alignment`, and `#show-assessment-alignment-report` in the viewport toolbar.
- `#initial-assessment-alignment` runs SB-origin rigid Kabsch; `#refined-assessment-alignment` runs rigid surface ICP after initial alignment.
- `assessmentScanbodyPairs()` pairs scanbodies by order only: SB1 to SB1, SB2 to SB2, etc.
- `assessmentKabschRigidTransform()` solves the best-fit rigid matrix using a Kabsch-style quaternion/eigen solution.
- `assessmentInitialScanAlignment(sourceScan, targetScan)` computes one rigid full-arch transform from SB-number matched scanbody origins only, and records each aligned test SB origin distance to the matched reference SB origin.
- `runAssessmentInitialAlignment()` initially aligns every test scan to the best reference scan candidate.
- `runAssessmentRefinedAlignment()` samples reconstructed library STL surfaces for each test/reference scan, solves one rigid ICP delta per test scan, composes it onto the scan-level matrix, and applies deviation color maps to test scanbodies.
- `refreshAssessmentAlignmentReportData()` recomputes per-scanbody distances after each initial/refined alignment, and `renderAssessmentAlignmentReport()` displays them in `#assessment-alignment-window`.

Report module:

- `collectAssessmentReportData()` groups Alignment Report scanbody distances by test group and scan.
- `renderReportModule()` renders a lead test-group comparison analysis, descriptive statistics tables, and SVG box plots in `#report-panel`.
- Report data comes from `scan.assessmentRegistration.scanbodyDistances`, so it refreshes after every initial or refined alignment.
- The whole full-arch test scan moves rigidly; inter-scanbody relationships inside that scan must not change.
- Registrations are cleared if reference data changes.

## Local origin markers

Small local XYZ axes and 0.1 mm origin spheres are attached to library-derived meshes. The marker axes and sphere use the entry/group color rather than fixed XYZ colors:

- `LIBRARY_ORIGIN_TYPES`
- `addLocalOriginAxes(entry)`
- `disposeLocalOriginAxes(entry)`

The origin sphere uses a 0.05 mm radius and matches the entry/group color.

Current marker-bearing types:

- `library`
- `registered`
- `assessment-library`
- `assessment-scanbody`

Because axes are children of the mesh, they follow each mesh transform automatically.

## CSS map

`static/styles.css`

- `:root` theme colors.
- `.topbar`, `.brand`, `.module-switcher`, `.module-tab` for header.
- `.workspace`, `.sidebar`, `.viewport-panel` for main layout.
- `.drop-zone`, `.model-row`, `.model-list` for uploads and file rows.
- `.assessment-*` for Accuracy Assessment stages, groups, color controls, metrics, trueness toolbar action.
- `.viewport-toolbar`, `.tool-group`, `.tool-button`, `.toggle-control` for controls.
- `.viewer`, `#scene-canvas`, `.object-hover-label`, `.viewer-empty`, `.loading` for WebGL region.
- `.objects-panel`, `.object-*`, `.assessment-dataset` for scene hierarchy.
- `.deviation-*` for deviation legend.
- `.matrix-*` for transformation matrix modal.
- `.report-*` for the Report module tables, summary cards, and box plots.
- `.axis-labels`, `.origin-caption`, `.axis` for lower-right local-origin legend.
- Responsive rules are at the bottom.

## Docs and packaging

- `README.md` — basic usage, local run, macOS build, guide rebuild.
- `outputs/OnXTrue_Project_Minutes.md` — historical project summary and known limitations; may be stale.
- `outputs/OnXTrue_Application_Guide.txt` — older text guide; may be stale.
- `work/build_application_guide.py` — generates `outputs/OnXTrue_STL_Viewer_Application_Guide.docx` using `python-docx`; optional screenshot via `ONXTRUE_GUIDE_SCREENSHOT`.
- `requirements.txt` — Flask.
- `requirements-macos.txt` — Flask + PyInstaller + pywebview.
- `requirements-docs.txt` — Flask + python-docx.
- `build_macos.sh` — validates vendored Three.js assets, runs PyInstaller, codesigns, builds DMG.
- `LICENSE` — GPL v3.

## Editing rules for future agents

- Use `rg` / `rg --files` first.
- Use `apply_patch` for file edits.
- Preserve unrelated dirty changes.
- Keep UI language concise and consistent with OnXTrue.
- Avoid adding network dependencies; Three.js is vendored.
- If adding UI selectors, workflows, or architecture, update both this file and `.agents/app-map.md` when relevant.
- After JS edits, run `node --check static/app.js`.
- After any edit, run `git diff --check`.
