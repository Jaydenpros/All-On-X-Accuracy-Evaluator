# OnXTrue App Map

Use this map before modifying the app. Search by the named function, selector, or route rather than relying on line numbers, which will drift.

## Architecture at a glance

OnXTrue is a local Flask application with a Three.js front end.

| Area | Primary file | Responsibility |
| --- | --- | --- |
| Flask server | `app.py` | Serves the page, validates/uploads STL files, and serves stored uploads |
| Page structure | `templates/index.html` | Both module sidebars, viewer toolbar, canvas overlays, object panel, and matrix modal |
| Front-end behavior | `static/app.js` | All state, Three.js rendering, STL parsing, registration, assessment reconstruction, and UI events |
| Styling | `static/styles.css` | Entire visual system and responsive layout |
| Desktop wrapper | `desktop.py` | Starts Flask on a free port and embeds it in a pywebview window |
| macOS packaging | `build_macos.sh` | Builds and signs the app bundle and DMG |
| Offline 3D dependencies | `static/vendor/three/` | Three.js, OrbitControls, and STLLoader |

The front end has two modules sharing one renderer, camera, grid, and object panel:

1. **Data Processing** — upload a library and full-arch scans, isolate scanbodies, register library copies, calculate deviation maps, and export matrices.
2. **Accuracy Assessment** — import a library and transformation JSON files, then reconstruct library copies from those matrices.

## Runtime and launch

- Local development command: `.venv/bin/flask --app app run --host 127.0.0.1 --port 5001 --no-debugger --no-reload`
- Codex launch skill: `/Users/Jaden/.codex/skills/open-onxtrue/scripts/launch.sh`
- Browser URL: `http://127.0.0.1:5001/`
- The server uses `5000` by default, but the Codex workflow prefers `5001`.
- With `--no-reload`, restart Flask after Python changes. JavaScript, CSS, and template changes need a browser refresh.
- Increment the `v=` query in `templates/index.html` when changing `static/app.js` or `static/styles.css` so the browser does not reuse stale assets.

Quick checks:

```bash
/Users/Jaden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check static/app.js
git diff --check
curl -sS http://127.0.0.1:5001/
```

## Backend map

### `app.py`

- `application_data_dir()` — selects storage root. `ONXTRUE_DATA_DIR` overrides the repository directory.
- `looks_like_stl()` — lightweight binary/ASCII STL validation.
- `index()` / `GET /` — renders `templates/index.html`.
- `upload_files()` / `POST /api/upload` — accepts multipart field `files`, validates `.stl`, stores it, and returns `{files, rejected}`.
- `uploaded_file()` / `GET /uploads/<filename>` — serves stored STL files.
- `too_large()` — returns JSON for the 500 MB upload limit.

Upload records returned to JavaScript contain:

```text
id, name, size, url
```

### `desktop.py`

- `user_data_dir()` — uses `~/Library/Application Support/OnXTrue`.
- `available_port()` — asks the OS for a free localhost port.
- `main()` — sets `ONXTRUE_DATA_DIR`, starts Flask in a background thread, and opens pywebview.

## HTML/UI map

All UI is in `templates/index.html`.

### Global shell

- `.topbar` — brand, module tabs, model count
- `.module-tab[data-module]` — switches between Data Processing, Accuracy Assessment, and Report
- `.sidebar` — contains both module-specific sidebars
- `.viewport-panel` — toolbar, viewer, and stats bar

### Data Processing sidebar

- `#data-processing-sidebar`
- `#data-library-color`, `#data-scans-color` — Data Processing display color pickers; Library recolors original and registered library copies; Scans recolors full-arch/isolated scans
- `#library-input`, `#library-drop-zone`, `#library-list`
- `#scans-input`, `#scans-drop-zone`, `#scans-list`
- `#clear-scans`

### Accuracy Assessment sidebar

- `#accuracy-assessment-sidebar`
- `#report-sidebar`, `#report-sidebar-summary`
- `#assessment-library-input`, `#assessment-library-zone`
- `#reference-json-input`, `#reference-json-zone`
- `#reference-group-color`
- `#test-groups-container`, `#add-test-group`
- `#clear-assessment`

### Viewer and controls

- `#scene-canvas` — Three.js canvas
- `#object-hover-label` — cursor-following 3D object name tooltip
- `centerViewOnMiddleClick()` — middle-clicking a visible mesh raycast hit moves `OrbitControls.target` to that clicked 3D point.
- `#fit-view`, `#reset-view`, `#center-library`
- `#assessment-workflow-toggle` — Accuracy Assessment segmented control labeled Trueness / Precision
- `#assessment-kabsch-mode` — Trueness Kabsch mode selector (`Origins only (current)` or `Origins · RMS-weighted`)
- `#assessment-kabsch-weighting` — RMS weighting selector for weighted-origin Kabsch (`Inverse-variance`, `Inverse`, or `Off`)
- `#initial-assessment-alignment` — Accuracy Assessment toolbar action labeled "Kabsch Align"
- `#refined-assessment-alignment` — Accuracy Assessment toolbar action labeled "ICP Align"; enabled after Kabsch alignment and runs rigid surface ICP
- `#show-assessment-alignment-report` — toolbar action labeled "Trueness Report"; opens the scanbody distance report
- `#precision-measure` — Precision Assessment toolbar action; virtually measures all compatible unordered scan pairs within each test group
- `#precision-report` — Precision Assessment toolbar action; opens within-group pairwise precision distances
- `#assessment-alignment-window`, `#assessment-alignment-list` — modal report of post-alignment test SB origin distances to matched reference SB origins
- `#assessment-registration-status`
- `#report-mode-toggle` — Report module segmented control for Trueness vs Precision
- `#report-panel`, `#report-summary-cards`, `#report-content` — Report module output
- `#reset-data-processing` — restores Data Processing to the last imported library/full-arch scan files and clears derived operations
- `#isolate-scanbodies`
- `#library-type-toggle` — opens the type-specific workflow panel next to Isolate Scanbodies
- `#library-type-select` — chooses the active scan body library type strategy (`Straumann SRA NEW` or `Straumann SRA Old`)
- `#feature-detect`, `#crop-scanbodies`, `#register-scanbodies` — panel actions routed through the selected scan body library strategy
- `#refine-registration` — Step 2 ICP and deviation
- `#plane-refinement` — Step 3 plane refinement
- `#show-registration-matrices`
- `#wireframe-toggle`, `#grid-toggle`, `#feature-seed-arrows-toggle`
- `#objects-panel`, `#data-objects-list`, `#assessment-objects-list`
- `#deviation-legend`, `#deviation-color-map-toggle`
- `#registration-matrix-window`

### Stats and feedback

- `#model-count`, `#triangle-count`, `#scene-size`, `#file-count`
- `#viewer-empty`, `#loading`, `#toast-region`

## CSS map

All styles are in `static/styles.css`.

- `:root` — theme colors, including library blue, scan green, and acid accent
- `.topbar`, `.module-switcher`, `.module-tab` — app header
- `.workspace`, `.sidebar`, `.viewport-panel` — primary layout
- `.drop-zone`, `.model-row` — Data Processing uploads and file rows
- `.assessment-*` — Accuracy Assessment upload stages, groups, colors, and metrics
- `.viewport-toolbar`, `.tool-button`, `.toggle-control` — viewer controls
- `.viewer`, `#scene-canvas`, `.object-hover-label` — WebGL area and hover tooltip
- `.objects-panel`, `.object-*`, `.assessment-dataset` — scene hierarchy
- `.deviation-*` — deviation color legend
- `.matrix-*` — transformation matrix modal
- `.axis-labels`, `.origin-caption`, `.axis` — lower-right XYZ legend
- media queries are at the bottom of the file

## Front-end state and scene graph

All front-end logic is in `static/app.js`.

### Shared Three.js objects

- `scene`, `camera`, `renderer`, `controls`
- `grid`
- `modelsGroup` — Data Processing scene root
- `assessmentGroup` — Accuracy Assessment scene root
- `animate()` — render loop
- `resizeRenderer()` — canvas/camera resize handling
- `fitView()` and `centerLibraryView()` — camera framing

`switchModule()` toggles the scene roots, report panel, object lists, and module sidebars.

### Data Processing state

- `models: Map<id, entry>`
- `scanGroups: Map<id, group>`

Important entry fields:

```text
id, name, bytes, triangles, size, color, type, isolated,
groupId, mesh, row, objectRow, userVisible
```

Registered copies may additionally contain:

```text
registrationStage, registrationFor, registrationTargetName,
registrationSourceName, registrationPreparation,
initialAlignmentError, registrationError,
icpRegistrationMatrix, registrationMatrix,
planeRefinementCompleted
```

Model types:

- `library` — original uploaded library
- `scan` — full-arch scan or isolated scanbody
- `registered` — transformed copy of the library

### Accuracy Assessment state

- `assessmentModels: Map<id, entry>`
- `assessmentScanGroups: Map<id, group>`
- `assessmentDataGroups: Map<id, dataset>`
- `assessmentLibrary` — original assessment library entry

Assessment model types:

- `assessment-library` — original library at its native origin
- `assessment-scanbody` — a library clone transformed by imported JSON

Dataset types:

- `reference`
- `test`

## Library origin markers

The local XYZ markers and 0.1 mm origin spheres are managed by:

- `LIBRARY_ORIGIN_TYPES`
- `addLocalOriginAxes(entry)`
- `disposeLocalOriginAxes(entry)`

Axes and spheres are children of each library-derived mesh. This is intentional: each marker automatically inherits the mesh's local translation, rotation, and scale.

Origin spheres use a 0.05 mm radius and match the entry/group color.

Marker-bearing types:

- `library`
- `registered`
- `assessment-library`
- `assessment-scanbody`

Creation call sites:

- `addModelFromGeometry()` — original and registered Data Processing libraries
- `rebuildAssessmentScene()` — reconstructed assessment copies
- `importAssessmentLibrary()` — original assessment library

Disposal call sites:

- `removeModel()`
- `disposeAssessmentEntry()`

If a new library-copy type is added, add it to `LIBRARY_ORIGIN_TYPES` and ensure its entry calls `addLocalOriginAxes()`.

## Data Processing flow

### Upload

```text
drop/input
  -> wireDropZone()
  -> uploadFiles()
  -> POST /api/upload
  -> loadUploadedModel()
  -> fetchSTLGeometry()
  -> addModelFromGeometry()
```

`uploadFiles()` replaces an existing library when a new library is uploaded.

### Model and object UI

- `createModelRow()` — sidebar file row
- `createObjectRow()` — 3D object panel row
- `setModelVisibility()` — mesh and UI visibility
- `removeModel()` — cleanup and state removal
- `updateUI()` — counts, buttons, empty states, and scene metrics
- `updateSceneReference()` — grid scale based on library/model size

### Scanbody isolation

Entry point: `isolateScanbodies()`

Supporting geometry functions:

- `isolateGeometry()`
- `uniqueVertices()`
- `componentsAreClose()`
- `mergeGeometries()`
- `groupNearbyComponents()`
- `filterSmallComponents()` — after 2 mm island merging, discards merged components whose largest bounding-box dimension is under 3 mm.
- `dataProcessingImportSnapshots` / `resetDataProcessingOperations()` — retain original imported library/full-arch geometries and rebuild them when Reset is clicked, clearing isolated children, feature overlays, registrations, deviations, and matrices.
- `SCANBODY_LIBRARY_STRATEGIES` — routes Feature Detect, Crop SBs, and Initial Alignment by selected Data Processing library type.
- `scanbodyLibraryStrategy()` — returns the active type strategy; current options are `straumann-sra-new` and `straumann-sra-old`.
- `inferScanbodyLibraryTypeFromName()` — switches the active strategy to `straumann-sra-old` when the library filename contains `Straumann SRA Old`.
- `classifyFeaturePlanes()` — baseline SRA NEW classifier; selects top ring plus rectangular side face from candidate planar patches using the seed-normal long axis.
- `applyStraumannSraOldFeaturePlanes()` / `detectStraumannSraOldReferenceFeatures()` — SRA Old axis-first detector; iteratively fits the long axis from wall normals, circle-fits wall centroids for center/radius, orients the axis toward the top cap, detects top plane and hole radius near the height maximum, and detects the angled bevel with RANSAC plus a 0.02 mm planar RMS quality gate.
- `cropGeometryToTopRingDistance()` / `cropScanbodies()` — currently keep triangles whose centers are within 4.6 mm of each object's detected top-ring plane for both strategies; Crop SBs crops the library plus isolated scanbodies, then Feature Detect runs again on the library and isolated scanbodies.

Isolated scanbodies are grouped with `createScanGroup()` and tracked in `scanGroups`.

### Registration pipeline

1. `detectFeatures()` — calls the selected library type strategy and builds rectangular frame overlays around the top detected flat planes for the library and isolated scanbodies; Step 1 remains disabled until this has run on the current objects.
2. `registerIsolatedScanbodies()` — calls the selected library type strategy, creates a cloned `registered` library for each isolated scanbody, and applies an initial matrix.
3. `refineInitialRegistrations()` — runs ICP, updates the registered copy, and computes deviations.
4. `refineRegistrationPlanes()` — performs constrained top/side plane refinement.

Core math:

- `sampleGeometryPoints()`
- `bestRigidTransform()`
- `planeRectangleFrameGeometry()` / `planeBorderGeometry()` — draw principal-axis oriented rectangular frames plus purple borders for the selected top-ring and second feature planes.
- `planarSeedIndices()` / `featureSeedSelection()` / `addPlanarSeedArrows()` — SRA NEW starts from 500 area-distributed detector seeds, excludes radial seeds whose normal lines pass within 0.45 mm of the estimated long axis, draws active seeds green and excluded seeds red, and adds 80 extra axis-parallel seeds so top-ring candidate generation remains well represented. SRA Old uses the same seed-arrow visualization after its axis-first detection but does not use seed-generated plane candidates.
- `estimateLongAxisFromSeedNormals()` / `addLongAxisLine()` — estimate the scanbody long axis from seed normals and draw a cyan axis line through the mesh center.
- `detectPlanarPatches()` — accepts an optional active seed index set; Feature Detect uses the filtered active set so excluded red seeds do not create planar candidates.
- `planePatchShapeMetrics()`
- `featureAlignmentCandidates()` / `prepareFeatureRegistration()` — Step 1 initial alignment uses the detected long axis, top-ring plane, and side plane already stored by Feature Detect; there are no generic principal-axis or re-detection fallbacks.
- `refineRegistration()`
- `refinePreparedRegistration()`
- `planeRefinementMatrix()`
- `renameRegisteredScanbodySequences()` — after Step 1 and again after Step 3, assigns `FullArch_SB1.stl ... SBn.stl` names from virtual arch order using registered library-copy centers and local Z orientation; does not alter mesh positions or registration matrices
- `setMeshTransform()`

Deviation map:

- `applyDeviationMap()`
- `prepareDeviationDisplayGeometry()` / `subdivideGeometryForDeviation()` — create a denser visual-only mesh for deviation coloring so coarse STL triangles can show sub-0.5 mm scale changes more accurately.
- `colorizeDeviationEntry()`
- `deviationColor()` — values above the selected deviation scale render as bright purple
- `setDeviationScale()`
- `applyDeviationColorMapVisibility()` / `setDeviationEntryBaseColor()` — toggle deviation vertex colors on/off without deleting stored deviation distances

Matrix display/export:

- `renderRegistrationMatrices()`
- `registrationExportData()`
- `exportRegistrationMatrices()`
- `openRegistrationMatrices()`
- Matrices are available immediately after Step 1 initial alignment and update in-place if the modal is open during ICP or plane refinement.

Matrix convention: transforms points from original library coordinates into registered scanbody coordinates.

## Accuracy Assessment flow

### Library import

```text
assessment input/drop
  -> importAssessmentLibrary()
  -> parseSTLFile()
  -> createAssessmentMesh()
  -> rebuildAssessmentScene()
```

### JSON import and reconstruction

```text
reference/test JSON input
  -> importAssessmentJsonFiles()
  -> normalizedAssessmentScans()
  -> assessmentMatrixFromRows()
  -> rebuildAssessmentScene()
  -> clone assessment library geometry
  -> mesh.applyMatrix4(matrix)
```

### Trueness assessment

Entry point: `runAssessmentInitialAlignment()`

- Every test scan is compared with compatible scans in the reference group.
- Scanbodies are paired by order only: SB1 to SB1, SB2 to SB2, etc.
- `#assessment-kabsch-mode` selects the initial Trueness Kabsch mode: stock origins-only landmarks or the same origin landmarks with optional RMS weighting.
- `assessmentInitialScanAlignment()` solves one best-fit rigid 4×4 transform for the entire test scan from ordered scanbody origins only.
- `assessmentOriginKabschCorrespondences()` builds the origin correspondence set and optional per-scanbody weights.
- `assessmentKabschRigidTransform()` uses a Kabsch-style quaternion/eigen rigid registration solve with optional per-point weights; weighted-origin mode defaults to inverse-variance scanbody weights when RMS values are present.
- `work/assessment_kabsch_origin_tests.mjs` is the focused regression script for the origin-only weighted Kabsch path.
- The same transform is pre-multiplied onto every original scanbody matrix in that scan.
- Internal scanbody-to-scanbody relationships therefore remain unchanged.
- The selected reference scan, RMS error, match count, and per-scanbody post-alignment origin distances are stored on the normalized scan.
- `#refined-assessment-alignment` samples reconstructed STL surfaces and solves one rigid ICP delta per test scan after initial alignment.
- Refined alignment composes that ICP delta onto the existing scan-level registration matrix, then applies deviation color maps to the test scanbody meshes.
- `#show-assessment-alignment-report` is enabled after initial alignment and renders `scanbodyDistances`, which are recomputed after every initial or refined alignment and displayed in micrometers.

### Precision assessment

Entry point: `runAssessmentPrecisionMeasure()`

- Precision uses only test groups; it does not compare to the reference group and does not compare across test groups.
- `assessmentScanPairsForDataset(datasetId)` generates every unordered scan pair inside one test group.
- Pairs are compatible only when both scans have the same scanbody count.
- `assessmentPrecisionPairMeasurement(sourceItem, targetItem)` pairs scanbodies by order, computes one virtual Kabsch transform from source SB origins to target SB origins, and measures post-alignment SB origin distances.
- Results are stored on the test dataset as `dataset.precisionAssessment = { measuredAt, pairs, stats }`.
- Precision measurement does not assign `scan.assessmentRegistrationMatrix`, does not assign `scan.assessmentRegistration`, does not call `rebuildAssessmentScene()`, and does not mutate mesh positions, colors, visibility, local origin axes, or deviation maps.
- `renderAssessmentPrecisionReport()` uses the shared `#assessment-alignment-window` modal to display pairwise scanbody distances.

Supporting functions:

- `assessmentScansForDataset()`
- `assessmentScanPairsForDataset()`
- `clearAssessmentRegistrations()`
- `assessmentScanbodyPairs()`
- `assessmentKabschLargestEigenvector()`
- `assessmentKabschRigidTransform()`
- `assessmentInitialScanAlignment()`
- `assessmentPrecisionPairMeasurement()`
- `availablePrecisionPairCount()`
- `precisionMeasuredPairCount()`
- `assessmentScanSurfacePoints()`
- `refreshAssessmentAlignmentReportData()`
- `runAssessmentPrecisionMeasure()`
- `runAssessmentRefinedAlignment()`
- `applyAssessmentRefinedDeviationMaps()`
- `renderAssessmentAlignmentReport()`
- `renderAssessmentPrecisionReport()`
- `reportGroupComparisonAnalysis()` — lead Report module section comparing test groups with summary ranking cards, a group stats table, and one combined boxplot per group.

### Report module

- `#report-mode-toggle` switches between Trueness and Precision report views.
- `collectTruenessReportData()` gathers `scan.assessmentRegistration.scanbodyDistances` from Trueness Report data and groups them by test group.
- `collectPrecisionReportData()` gathers `dataset.precisionAssessment.pairs` and groups pairwise scanbody distances by test group.
- `renderReportModule()` routes to `renderTruenessReportModule()` or `renderPrecisionReportModule()`.
- Each report view renders summary cards, descriptive statistics tables, one combined box plot per test group, and per-scan/per-pair SVG box plots; stored distances remain in millimeters, but all report-facing distance values display in micrometers with two decimals.
- Trueness output is empty until Kabsch or ICP alignment has generated distances. Precision output is empty until Precision Measure has generated pairwise distances.

Group management:

- `initializeAssessmentDataGroups()`
- `createAssessmentTestGroup()`
- `renderAssessmentDataGroups()`
- `bindAssessmentDataGroupControls()`
- `setAssessmentDataGroupColor()`

Scene/object management:

- `createAssessmentMesh()`
- `rebuildAssessmentScene()`
- `renderAssessmentObjects()`
- `setAssessmentVisibility()`
- `setAssessmentGroupVisibility()`
- `setAssessmentDatasetVisibility()`
- `updateAssessmentUI()`
- `clearAssessment()`

## Common modification recipes

### Add or change a toolbar control

1. Add/change markup in the viewer toolbar in `templates/index.html`.
2. Style it near `.tool-button` in `static/styles.css`.
3. Query it near the top of `static/app.js`.
4. Add its event listener in the bottom wiring section.
5. Update disabled/hidden state in `updateUI()`, `updateAssessmentUI()`, or `switchModule()`.

### Change an object's rendering

1. Data Processing meshes: `addModelFromGeometry()`.
2. Accuracy Assessment meshes: `createAssessmentMesh()`.
3. Per-type defaults: `TYPE_CONFIG`.
4. Data Processing library/scan color controls: `setDataProcessingTypeColor()`, `updateEntryColor()`, and `syncDataProcessingColorInputs()`.
5. Visibility: `setModelVisibility()` or assessment visibility functions.
6. Disposal: `removeModel()` and `disposeAssessmentEntry()`.

### Add metadata to every model

1. Add fields where the entry is constructed in `addModelFromGeometry()`.
2. Add corresponding assessment fields in `importAssessmentLibrary()` and `rebuildAssessmentScene()` if needed.
3. Update object rows in `createObjectRow()` and/or `renderAssessmentObjects()`.
4. Include cleanup if the field owns Three.js resources.

### Change registration behavior

Start with the three pipeline entry points, then follow into `prepareFeatureRegistration()`, `refinePreparedRegistration()`, or `planeRefinementMatrix()`. Preserve the library-to-scanbody matrix convention.

### Change imported transformation JSON

Start at `normalizedAssessmentScans()` and `assessmentMatrixFromRows()`, then verify `rebuildAssessmentScene()`.

### Change layout or branding

Page content is in `templates/index.html`; visual treatment is in `static/styles.css`. Search existing class names before adding new selectors.

## Important invariants and pitfalls

- Do not center or translate STL geometry on import. Native library coordinates are meaningful for transformation matrices and origin markers.
- Registered and reconstructed objects are cloned library geometry transformed at the mesh level.
- Keep local origin axes parented to the corresponding mesh.
- Preserve `userVisible` separately from module-level scene visibility.
- When disposing a mesh, also dispose owned helper geometry/materials.
- Data Processing and Accuracy Assessment use separate maps and scene roots; a feature affecting “all library copies” usually needs both paths.
- `static/app.js` is an ES module. Use a modern Node binary for syntax checks.
- Three.js is bundled locally; do not replace imports with CDN URLs.
- The working tree may contain unrelated user changes. Make narrow edits and do not revert them.
- After front-end changes, refresh the existing browser tab; after changing asset URLs, verify the served HTML contains the new version.

## Maintenance rule

Update this map whenever any of these change:

- a route or upload record shape
- a major UI section or selector
- model types or entry fields
- scene roots or lifecycle functions
- registration stages or matrix convention
- assessment JSON format
- launch/build commands
