import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

const canvas = document.querySelector("#scene-canvas");
const viewer = document.querySelector("#viewer");
const objectHoverLabel = document.querySelector("#object-hover-label");
const libraryInput = document.querySelector("#library-input");
const scansInput = document.querySelector("#scans-input");
const libraryDropZone = document.querySelector("#library-drop-zone");
const scansDropZone = document.querySelector("#scans-drop-zone");
const libraryList = document.querySelector("#library-list");
const scansList = document.querySelector("#scans-list");
const libraryEmpty = document.querySelector("#library-empty");
const scansEmpty = document.querySelector("#scans-empty");
const dataLibraryColorInput = document.querySelector("#data-library-color");
const dataScansColorInput = document.querySelector("#data-scans-color");
const viewerEmpty = document.querySelector("#viewer-empty");
const loading = document.querySelector("#loading");
const clearScansButton = document.querySelector("#clear-scans");
const wireframeToggle = document.querySelector("#wireframe-toggle");
const gridToggle = document.querySelector("#grid-toggle");
const featureSeedArrowsToggle = document.querySelector("#feature-seed-arrows-toggle");
const objectsPanel = document.querySelector("#objects-panel");
const objectsList = document.querySelector("#objects-list");
const dataObjectsList = document.querySelector("#data-objects-list");
const assessmentObjectsList = document.querySelector("#assessment-objects-list");
const assessmentObjectsEmpty = document.querySelector("#assessment-objects-empty");
const objectsEmpty = document.querySelector("#objects-empty");
const showAllObjectsButton = document.querySelector("#show-all-objects");
const hideAllObjectsButton = document.querySelector("#hide-all-objects");
const resetDataProcessingButton = document.querySelector("#reset-data-processing");
const isolateScanbodiesButton = document.querySelector("#isolate-scanbodies");
const libraryTypeWorkflow = document.querySelector("#library-type-workflow");
const libraryTypeToggle = document.querySelector("#library-type-toggle");
const libraryTypePanel = document.querySelector("#library-type-panel");
const libraryTypeSelect = document.querySelector("#library-type-select");
const libraryTypeCurrent = document.querySelector("#library-type-current");
const featureDetectButton = document.querySelector("#feature-detect");
const cropScanbodiesButton = document.querySelector("#crop-scanbodies");
const registerScanbodiesButton = document.querySelector("#register-scanbodies");
const refineRegistrationButton = document.querySelector("#refine-registration");
const planeRefinementButton = document.querySelector("#plane-refinement");
const centerLibraryButton = document.querySelector("#center-library");
const deviationLegend = document.querySelector("#deviation-legend");
const deviationColorMapToggle = document.querySelector("#deviation-color-map-toggle");
const deviationScaleRange = document.querySelector("#deviation-scale-range");
const deviationScaleNumber = document.querySelector("#deviation-scale-number");
const registrationMatricesButton = document.querySelector("#show-registration-matrices");
const registrationMatrixWindow = document.querySelector("#registration-matrix-window");
const registrationMatrixList = document.querySelector("#registration-matrix-list");
const registrationExportFilename = document.querySelector("#registration-export-filename");
const assessmentAlignmentReportButton = document.querySelector("#show-assessment-alignment-report");
const assessmentAlignmentWindow = document.querySelector("#assessment-alignment-window");
const assessmentAlignmentWindowTitle = document.querySelector("#assessment-alignment-window-title");
const assessmentAlignmentWindowDescription = document.querySelector("#assessment-alignment-window-description");
const assessmentAlignmentList = document.querySelector("#assessment-alignment-list");
const reportPanel = document.querySelector("#report-panel");
const reportPanelKicker = document.querySelector("#report-panel-kicker");
const reportPanelTitle = document.querySelector("#report-panel-title");
const reportPanelDescription = document.querySelector("#report-panel-description");
const reportContent = document.querySelector("#report-content");
const reportSummaryCards = document.querySelector("#report-summary-cards");
const reportSidebarSummary = document.querySelector("#report-sidebar-summary");
const reportModeToggle = document.querySelector("#report-mode-toggle");
const viewportPanel = document.querySelector(".viewport-panel");
const viewportToolbar = document.querySelector("#viewport-toolbar");
const statsBar = document.querySelector(".stats-bar");
const assessmentLibraryInput = document.querySelector("#assessment-library-input");
const assessmentLibraryZone = document.querySelector("#assessment-library-zone");
const assessmentLibraryStatus = document.querySelector("#assessment-library-status");
const referenceJsonInput = document.querySelector("#reference-json-input");
const referenceJsonZone = document.querySelector("#reference-json-zone");
const referenceFileList = document.querySelector("#reference-file-list");
const referenceGroupColor = document.querySelector("#reference-group-color");
const testGroupsContainer = document.querySelector("#test-groups-container");
const addTestGroupButton = document.querySelector("#add-test-group");
const assessmentWorkflowToggle = document.querySelector("#assessment-workflow-toggle");
const truenessAssessmentActions = document.querySelector("#trueness-assessment-actions");
const precisionAssessmentActions = document.querySelector("#precision-assessment-actions");
const assessmentKabschModeSelect = document.querySelector("#assessment-kabsch-mode");
const assessmentKabschWeightSelect = document.querySelector("#assessment-kabsch-weighting");
const initialAssessmentAlignmentButton = document.querySelector("#initial-assessment-alignment");
const refinedAssessmentAlignmentButton = document.querySelector("#refined-assessment-alignment");
const precisionMeasureButton = document.querySelector("#precision-measure");
const precisionReportButton = document.querySelector("#precision-report");
const assessmentRegistrationStatus = document.querySelector("#assessment-registration-status");
const clearAssessmentButton = document.querySelector("#clear-assessment");
let activeModule = "data-processing";
let activeAssessmentWorkflow = "trueness";
let activeReportMode = "trueness";
let activeAssessmentModalReport = "trueness";
let selectedScanbodyLibraryType = "straumann-sra-new";
let activeAssessmentKabschMode = "origin";
let activeAssessmentKabschWeightMode = "invVar";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x171918, 0.0014);

const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000000);
camera.up.set(0, 0, 1);
camera.position.set(120, 150, 95);
const hoverRaycaster = new THREE.Raycaster();
const hoverPointer = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.screenSpacePanning = true;
controls.minDistance = 0.01;
controls.maxDistance = 500000;

scene.add(new THREE.HemisphereLight(0xe8f0e9, 0x262b27, 2.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
keyLight.position.set(130, 180, 110);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xd9ff43, 1.6);
rimLight.position.set(-120, 60, -80);
scene.add(rimLight);

const grid = new THREE.GridHelper(200, 20, 0x586054, 0x303530);
grid.rotation.x = Math.PI / 2;
grid.material.opacity = 0.38;
grid.material.transparent = true;
scene.add(grid);

const modelsGroup = new THREE.Group();
scene.add(modelsGroup);
const assessmentGroup = new THREE.Group();
assessmentGroup.visible = false;
scene.add(assessmentGroup);

const loader = new STLLoader();
const models = new Map();
const scanGroups = new Map();
const dataProcessingImportSnapshots = new Map();
const assessmentModels = new Map();
const assessmentScanGroups = new Map();
const assessmentDataGroups = new Map();
let assessmentLibrary = null;
let nextAssessmentTestGroup = 1;
let deviationScaleMaximum = 0.5;
let deviationColorMapVisible = true;
let featureSeedArrowsVisible = false;
const DEVIATION_DISPLAY_MAX_EDGE = 0.18;
const DEVIATION_DISPLAY_MAX_SEGMENTS = 12;
const FEATURE_PLANE_MIN_FRAME_SIZE = 2;
const FEATURE_PLANE_CLASSIFIER_CANDIDATES = 40;
const FEATURE_BASE_SEED_COUNT = 500;
const FEATURE_AXIS_PARALLEL_SEED_COUNT = 80;
const FEATURE_AXIS_PARALLEL_DOT = 0.85;
const FEATURE_RADIAL_AXIS_DISTANCE = 0.45;
const SRA_OLD_AXIS_ITERATIONS = 12;
const SRA_OLD_WALL_NORMAL_MIN_ANGLE_DEGREES = 70;
const SRA_OLD_CAP_AXIS_DOT = 0.9;
const SRA_OLD_TOP_NORMAL_ANGLE_DEGREES = 18;
const SRA_OLD_TOP_HEIGHT_WINDOW = 1.8;
const SRA_OLD_HOLE_RADIUS_PERCENTILE = 0.02;
const SRA_OLD_BEVEL_MIN_AXIS_DOT = 0.2;
const SRA_OLD_BEVEL_MAX_AXIS_DOT = 0.82;
const SRA_OLD_BEVEL_TOP_WINDOW = 5;
const SRA_OLD_BEVEL_RANSAC_DISTANCE = 0.12;
const SRA_OLD_BEVEL_RANSAC_NORMAL_ANGLE_DEGREES = 10;
const SRA_OLD_BEVEL_PLANAR_RMS_MAX = 0.02;
const SCANBODY_CROP_TOP_RING_DISTANCE = 4.6;
const ASSESSMENT_KABSCH_WEIGHT_EPSILON = 1e-6;
const ASSESSMENT_GROUP_COLORS = ["#ffb35c", "#70e39f", "#ff72a8", "#b897ff", "#ffe066", "#56a8ff"];
const TYPE_CONFIG = {
  library: { color: 0xff3b30, label: "LIBRARY" },
  scan: { color: 0x00ff66, label: "FULL-ARCH SCAN" },
  registered: { color: 0xff3b30, label: "REGISTERED LIBRARY" },
  "assessment-library": { color: 0xc488ff, label: "ASSESSMENT LIBRARY" },
  "assessment-scanbody": { color: 0x56d8ff, label: "RECONSTRUCTED SCANBODY" },
};
const SCANBODY_LIBRARY_STRATEGIES = {
  "straumann-sra-new": {
    label: "Straumann SRA NEW",
    detectFeatures: detectStraumannSraNewFeatures,
    cropScanbody: cropStraumannSraNewScanbody,
    prepareInitialAlignment: prepareStraumannSraNewInitialAlignment,
  },
  "straumann-sra-old": {
    label: "Straumann SRA Old",
    detectFeatures: detectStraumannSraOldFeatures,
    cropScanbody: cropStraumannSraOldScanbody,
    prepareInitialAlignment: prepareStraumannSraOldInitialAlignment,
  },
};
const LIBRARY_ORIGIN_TYPES = new Set([
  "library",
  "registered",
  "assessment-library",
  "assessment-scanbody",
]);

function addLocalOriginAxes(entry) {
  if (!LIBRARY_ORIGIN_TYPES.has(entry.type) || entry.originAxes) return;
  const maximumDimension = Math.max(entry.size.x, entry.size.y, entry.size.z, 0.1);
  const originAxes = new THREE.AxesHelper(maximumDimension * 0.2);
  const originSphereColor = entry.color instanceof THREE.Color
    ? entry.color.clone()
    : entry.mesh.material.color.clone();
  const originSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 12),
    new THREE.MeshBasicMaterial({
      color: originSphereColor,
      depthTest: false,
      depthWrite: false,
    }),
  );
  originAxes.name = "library-local-origin";
  originAxes.renderOrder = 10;
  originAxes.material.depthTest = false;
  originAxes.material.depthWrite = false;
  originAxes.material.vertexColors = false;
  originAxes.material.color.copy(originSphereColor);
  originAxes.material.transparent = true;
  originAxes.material.opacity = 0.95;
  originSphere.name = "library-local-origin-sphere";
  originSphere.renderOrder = 11;
  entry.mesh.add(originAxes);
  entry.mesh.add(originSphere);
  entry.originAxes = originAxes;
  entry.originSphere = originSphere;
}

function setLocalOriginMarkerColor(entry, color) {
  const markerColor = color instanceof THREE.Color ? color : new THREE.Color(color);
  if (entry.originAxes?.material) {
    entry.originAxes.material.vertexColors = false;
    entry.originAxes.material.color.copy(markerColor);
    entry.originAxes.material.needsUpdate = true;
  }
  if (entry.originSphere?.material) {
    entry.originSphere.material.color.copy(markerColor);
    entry.originSphere.material.needsUpdate = true;
  }
}

function colorValueForType(type) {
  return `#${new THREE.Color(TYPE_CONFIG[type]?.color || TYPE_CONFIG.scan.color).getHexString()}`;
}

function colorToRgba(color, alpha) {
  const threeColor = color instanceof THREE.Color ? color : new THREE.Color(color);
  return `rgba(${Math.round(threeColor.r * 255)}, ${Math.round(threeColor.g * 255)}, ${Math.round(threeColor.b * 255)}, ${alpha})`;
}

function syncDataProcessingColorInputs() {
  if (dataLibraryColorInput) dataLibraryColorInput.value = colorValueForType("library");
  if (dataScansColorInput) dataScansColorInput.value = colorValueForType("scan");
  document.documentElement.style.setProperty("--library", colorValueForType("library"));
  document.documentElement.style.setProperty("--library-dim", colorToRgba(TYPE_CONFIG.library.color, 0.12));
  document.documentElement.style.setProperty("--scans", colorValueForType("scan"));
  document.documentElement.style.setProperty("--scans-dim", colorToRgba(TYPE_CONFIG.scan.color, 0.11));
}

function updateEntryColor(entry, color, { updateMaterial = true } = {}) {
  const nextColor = color instanceof THREE.Color ? color.clone() : new THREE.Color(color);
  entry.color.copy(nextColor);
  if (updateMaterial) {
    if (entry.deviationDistances && deviationColorMapVisible) {
      colorizeDeviationEntry(entry, deviationScaleMaximum);
    } else {
      entry.mesh.material.vertexColors = false;
      entry.mesh.material.color.copy(nextColor);
      entry.mesh.material.needsUpdate = true;
    }
  }
  const hex = `#${nextColor.getHexString()}`;
  const modelSwatch = entry.row?.querySelector(".model-color");
  if (modelSwatch) modelSwatch.style.background = hex;
  const objectSwatch = entry.objectRow?.querySelector(".object-swatch");
  if (objectSwatch) {
    objectSwatch.style.color = hex;
    objectSwatch.style.background = hex;
  }
  setLocalOriginMarkerColor(entry, nextColor);
}

function updateScanGroupColor(group, color) {
  const nextColor = color instanceof THREE.Color ? color : new THREE.Color(color);
  const hex = `#${nextColor.getHexString()}`;
  const swatch = group?.row?.querySelector(".object-group-row > .object-swatch");
  if (swatch) {
    swatch.style.color = hex;
    swatch.style.background = hex;
  }
}

function setDataProcessingTypeColor(type, value) {
  if (!TYPE_CONFIG[type]) return;
  const color = new THREE.Color(value);
  TYPE_CONFIG[type].color = color.getHex();
  if (type === "library") TYPE_CONFIG.registered.color = color.getHex();
  syncDataProcessingColorInputs();
  const affectedTypes = type === "library" ? new Set(["library", "registered"]) : new Set([type]);
  [...models.values()]
    .filter((entry) => affectedTypes.has(entry.type))
    .forEach((entry) => updateEntryColor(entry, color));
  if (type === "scan") {
    scanGroups.forEach((group) => updateScanGroupColor(group, color));
  }
}

function disposeLocalOriginAxes(entry) {
  if (!entry.originAxes) return;
  entry.mesh.remove(entry.originAxes);
  entry.originAxes.geometry.dispose();
  entry.originAxes.material.dispose();
  entry.originAxes = null;
  if (entry.originSphere) {
    entry.mesh.remove(entry.originSphere);
    entry.originSphere.geometry.dispose();
    entry.originSphere.material.dispose();
    entry.originSphere = null;
  }
}

function disposeFeatureEdges(entry) {
  if (!entry.featureEdges) {
    entry.featureEdgesDetected = false;
    delete entry.featurePlanes;
    return;
  }
  entry.mesh.remove(entry.featureEdges);
  entry.featureEdges.traverse((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
    else child.material?.dispose();
  });
  entry.featureEdges = null;
  entry.featureEdgesDetected = false;
  delete entry.featurePlanes;
}

function invalidateFeatureDetection(entries = [...models.values()]) {
  entries.forEach((entry) => disposeFeatureEdges(entry));
}

function scanbodyLibraryStrategy(type = selectedScanbodyLibraryType) {
  return SCANBODY_LIBRARY_STRATEGIES[type] || SCANBODY_LIBRARY_STRATEGIES["straumann-sra-new"];
}

function dataLibraryEntry() {
  return [...models.values()].find((entry) => entry.type === "library");
}

function inferScanbodyLibraryTypeFromName(name = "") {
  const normalizedName = name.toLowerCase().replace(/[_-]+/g, " ");
  if (normalizedName.includes("straumann sra old")) return "straumann-sra-old";
  if (normalizedName.includes("straumann sra new")) return "straumann-sra-new";
  return null;
}

function modelMetaText(entry) {
  const typeLabel = TYPE_CONFIG[entry.type].label;
  const libraryType = entry.type === "library"
    ? ` · ${scanbodyLibraryStrategy(entry.libraryType).label}`
    : "";
  return `${typeLabel}${libraryType} · ${formatBytes(entry.bytes)} · ${formatNumber(entry.triangles)} TRI`;
}

function deleteDataProcessingImportSnapshot(id) {
  const snapshot = dataProcessingImportSnapshots.get(id);
  snapshot?.geometry?.dispose();
  dataProcessingImportSnapshots.delete(id);
}

function deleteDataProcessingImportSnapshotsByType(type) {
  [...dataProcessingImportSnapshots.entries()]
    .filter(([, snapshot]) => snapshot.type === type)
    .forEach(([id]) => deleteDataProcessingImportSnapshot(id));
}

function storeDataProcessingImportSnapshot(entry) {
  if (!entry || entry.type === "registered" || entry.isolated) return;
  if (entry.type !== "library" && entry.type !== "scan") return;
  deleteDataProcessingImportSnapshot(entry.id);
  dataProcessingImportSnapshots.set(entry.id, {
    id: entry.id,
    name: entry.name,
    bytes: entry.bytes,
    type: entry.type,
    libraryType: entry.libraryType,
    geometry: entry.mesh.geometry.clone(),
  });
}

function resetDataProcessingOperations() {
  if (!dataProcessingImportSnapshots.size) return;
  const snapshots = [...dataProcessingImportSnapshots.values()];
  const librarySnapshot = snapshots.find((snapshot) => snapshot.type === "library");
  if (librarySnapshot?.libraryType) selectedScanbodyLibraryType = librarySnapshot.libraryType;

  [...models.keys()].forEach((id) => removeModel(id, false, false));
  scanGroups.clear();

  snapshots
    .slice()
    .sort((first, second) => (first.type === "library" ? -1 : 0) - (second.type === "library" ? -1 : 0))
    .forEach((snapshot) => {
      addModelFromGeometry({
        geometry: snapshot.geometry.clone(),
        id: snapshot.id,
        name: snapshot.name,
        bytes: snapshot.bytes,
        type: snapshot.type,
        libraryType: snapshot.libraryType,
      });
    });

  updateSceneReference();
  updateUI();
  if (models.size) fitView();
  showToast("Reset to the last imported library and full-arch scan files.");
}

function baselineDetectScanbodyFeatures(entry, classifier = classifyFeaturePlanes) {
  return applyFeaturePlanes(entry, classifier);
}

function baselineCropScanbodyToTopRing(entry) {
  return cropGeometryToTopRingDistance(
    entry.deviationBaseGeometry || entry.mesh.geometry,
    entry.featurePlanes.topRing,
    SCANBODY_CROP_TOP_RING_DISTANCE,
  );
}

function baselinePrepareInitialAlignment(libraryEntry, scanbodyEntry) {
  return prepareFeatureRegistration(libraryEntry, scanbodyEntry);
}

function detectStraumannSraNewFeatures(entry) {
  return baselineDetectScanbodyFeatures(entry);
}

function cropStraumannSraNewScanbody(entry) {
  return baselineCropScanbodyToTopRing(entry);
}

function prepareStraumannSraNewInitialAlignment(libraryEntry, scanbodyEntry) {
  return baselinePrepareInitialAlignment(libraryEntry, scanbodyEntry);
}

function detectStraumannSraOldFeatures(entry) {
  return applyStraumannSraOldFeaturePlanes(entry);
}

function cropStraumannSraOldScanbody(entry) {
  return baselineCropScanbodyToTopRing(entry);
}

function prepareStraumannSraOldInitialAlignment(libraryEntry, scanbodyEntry) {
  return baselinePrepareInitialAlignment(libraryEntry, scanbodyEntry);
}

function setLibraryTypePanelOpen(open) {
  libraryTypePanel.hidden = !open;
  libraryTypeToggle.setAttribute("aria-expanded", String(open));
  libraryTypeWorkflow.classList.toggle("panel-open", open);
}

function clearTypeDependentData() {
  [...models.values()]
    .filter((entry) => entry.type === "registered")
    .forEach((entry) => removeModel(entry.id, false));
  [...models.values()]
    .filter((entry) => entry.type === "scan")
    .forEach((entry) => {
      entry.registered = false;
      clearDeviationMap(entry, entry.color || TYPE_CONFIG.scan.color);
      clearAlignmentMarker(entry);
    });
  invalidateFeatureDetection();
  if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();
  updateDeviationLegendState();
}

function setScanbodyLibraryType(type) {
  if (!SCANBODY_LIBRARY_STRATEGIES[type]) return;
  if (type === selectedScanbodyLibraryType) return;
  selectedScanbodyLibraryType = type;
  const library = dataLibraryEntry();
  if (library) {
    library.libraryType = type;
    library.row.querySelector(".model-meta").textContent = modelMetaText(library);
  }
  clearTypeDependentData();
  updateUI();
  showToast(`Library type set to ${scanbodyLibraryStrategy().label}. Run Feature Detect again.`);
}

function applyFeatureSeedArrowVisibility() {
  models.forEach((entry) => {
    if (!entry.featureEdges) return;
    entry.featureEdges.traverse((child) => {
      if (!child.name?.startsWith("feature-seed-normal")) return;
      child.visible = featureSeedArrowsVisible;
    });
  });
}

function resizeRenderer() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function hideObjectHoverLabel() {
  objectHoverLabel.hidden = true;
  objectHoverLabel.textContent = "";
}

function activeHoverEntries() {
  const source = activeModule === "accuracy-assessment" ? assessmentModels : models;
  return [...source.values()].filter((entry) => (
    entry.mesh
    && entry.mesh.visible
    && entry.userVisible !== false
  ));
}

function positionObjectHoverLabel(event) {
  const viewerRect = viewer.getBoundingClientRect();
  const offset = 14;
  const labelWidth = objectHoverLabel.offsetWidth;
  const labelHeight = objectHoverLabel.offsetHeight;
  const maximumX = Math.max(viewerRect.width - labelWidth - 8, 8);
  const maximumY = Math.max(viewerRect.height - labelHeight - 8, 8);
  const x = THREE.MathUtils.clamp(event.clientX - viewerRect.left + offset, 8, maximumX);
  const y = THREE.MathUtils.clamp(event.clientY - viewerRect.top + offset, 8, maximumY);
  objectHoverLabel.style.transform = `translate(${x}px, ${y}px)`;
}

function updateObjectHoverLabel(event) {
  const entries = activeHoverEntries();
  if (!entries.length) {
    hideObjectHoverLabel();
    return;
  }

  const canvasRect = canvas.getBoundingClientRect();
  hoverPointer.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
  hoverPointer.y = -(((event.clientY - canvasRect.top) / canvasRect.height) * 2 - 1);
  hoverRaycaster.setFromCamera(hoverPointer, camera);

  const meshes = entries.map((entry) => entry.mesh);
  const intersections = hoverRaycaster.intersectObjects(meshes, false);
  if (!intersections.length) {
    hideObjectHoverLabel();
    return;
  }

  const hoveredEntry = entries.find((entry) => entry.mesh === intersections[0].object);
  if (!hoveredEntry) {
    hideObjectHoverLabel();
    return;
  }

  objectHoverLabel.textContent = hoveredEntry.name;
  objectHoverLabel.hidden = false;
  positionObjectHoverLabel(event);
}

function centerViewOnMiddleClick(event) {
  if (event.button !== 1) return;
  const entries = activeHoverEntries();
  if (!entries.length) return;

  const canvasRect = canvas.getBoundingClientRect();
  hoverPointer.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
  hoverPointer.y = -(((event.clientY - canvasRect.top) / canvasRect.height) * 2 - 1);
  hoverRaycaster.setFromCamera(hoverPointer, camera);
  const intersections = hoverRaycaster.intersectObjects(entries.map((entry) => entry.mesh), false);
  if (!intersections.length) return;

  event.preventDefault();
  hideObjectHoverLabel();
  controls.target.copy(intersections[0].point);
  controls.update();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  setTimeout(() => toast.remove(), 4200);
}

function parseBinarySTL(buffer) {
  if (buffer.byteLength < 84) return null;

  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  const expectedLength = 84 + triangleCount * 50;
  if (expectedLength !== buffer.byteLength) return null;

  const positions = new Float32Array(triangleCount * 9);
  const normals = new Float32Array(triangleCount * 9);
  let offset = 84;

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    offset += 12;

    for (let vertex = 0; vertex < 3; vertex += 1) {
      const target = triangle * 9 + vertex * 3;
      positions[target] = view.getFloat32(offset, true);
      positions[target + 1] = view.getFloat32(offset + 4, true);
      positions[target + 2] = view.getFloat32(offset + 8, true);
      normals[target] = nx;
      normals[target + 1] = ny;
      normals[target + 2] = nz;
      offset += 12;
    }

    offset += 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  return geometry;
}

async function fetchSTLGeometry(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`STL download failed with HTTP ${response.status}.`);

  const buffer = await response.arrayBuffer();
  const binaryGeometry = parseBinarySTL(buffer);
  if (binaryGeometry) return binaryGeometry;

  return loader.parse(buffer);
}

async function parseSTLFile(file) {
  const buffer = await file.arrayBuffer();
  return parseBinarySTL(buffer) || loader.parse(buffer);
}

function updateUI() {
  if (activeModule === "accuracy-assessment") {
    updateAssessmentUI();
    return;
  }
  const entries = [...models.values()];
  const visible = entries.filter((entry) => entry.mesh.visible);
  const libraryEntries = entries.filter((entry) => entry.type === "library");
  const scanEntries = entries.filter((entry) => entry.type === "scan");
  const registeredEntries = entries.filter((entry) => entry.type === "registered");
  const initialRegistrations = registeredEntries.filter((entry) => entry.registrationStage === "initial");
  const isolatedScanEntries = scanEntries.filter((entry) => entry.isolated);
  const featureDetectionTargets = [...libraryEntries, ...isolatedScanEntries];
  const featureDetectionReady = libraryEntries.length > 0
    && isolatedScanEntries.length > 0
    && featureDetectionTargets.every((entry) => entry.featureEdgesDetected);
  const cropScanbodiesReady = libraryEntries.length > 0
    && libraryEntries.every((entry) => entry.featurePlanes?.topRing)
    && isolatedScanEntries.length > 0
    && isolatedScanEntries.every((entry) => entry.featurePlanes?.topRing)
    && isolatedScanEntries.every((entry) => !entry.registered);
  const completedRegistrations = registeredEntries.filter((entry) => (
    entry.registrationStage === "final" || entry.registrationStage === "plane-refined"
  ));
  const matrixRegistrations = registeredEntries.filter((entry) => entry.registrationMatrix);
  const pendingPlaneRefinements = registeredEntries.filter((entry) => (
    entry.registrationStage === "final" && !entry.planeRefinementCompleted
  ));
  const triangleTotal = visible.reduce((sum, entry) => sum + entry.triangles, 0);

  libraryEmpty.hidden = libraryEntries.length > 0;
  scansEmpty.hidden = scanEntries.length > 0;
  objectsEmpty.hidden = entries.length > 0;
  viewerEmpty.hidden = entries.length > 0;
  clearScansButton.disabled = scanEntries.length === 0;
  resetDataProcessingButton.disabled = dataProcessingImportSnapshots.size === 0;
  isolateScanbodiesButton.disabled = !scanEntries.some((entry) => !entry.isolated);
  libraryTypeSelect.value = selectedScanbodyLibraryType;
  libraryTypeCurrent.textContent = scanbodyLibraryStrategy().label;
  featureDetectButton.disabled = libraryEntries.length === 0 || isolatedScanEntries.length === 0;
  cropScanbodiesButton.disabled = !cropScanbodiesReady;
  featureSeedArrowsToggle.disabled = !featureDetectionTargets.some((entry) => entry.featureEdges);
  centerLibraryButton.disabled = libraryEntries.length === 0;
  registerScanbodiesButton.disabled = libraryEntries.length === 0
    || !scanEntries.some((entry) => entry.isolated && !entry.registered)
    || !featureDetectionReady;
  refineRegistrationButton.disabled = initialRegistrations.length === 0;
  planeRefinementButton.disabled = pendingPlaneRefinements.length === 0;
  registrationMatricesButton.disabled = matrixRegistrations.length === 0;
  featureDetectButton.title = `Detect features using ${scanbodyLibraryStrategy().label} logic.`;
  cropScanbodiesButton.title = `Crop the library and scanbodies using ${scanbodyLibraryStrategy().label} logic.`;
  registerScanbodiesButton.title = `Run ${scanbodyLibraryStrategy().label} initial alignment.`;
  updateDeviationLegendState();
  showAllObjectsButton.disabled = entries.length === 0 || visible.length === entries.length;
  hideAllObjectsButton.disabled = entries.length === 0 || visible.length === 0;
  document.querySelector("#scans-label").textContent = `${scanEntries.length} FULL-ARCH SCAN FILE${scanEntries.length === 1 ? "" : "S"}`;
  document.querySelector("#model-count").textContent = `${entries.length} MODEL${entries.length === 1 ? "" : "S"}`;
  document.querySelector("#file-count").textContent = `${libraryEntries.length} / ${scanEntries.length}`;
  document.querySelector("#triangle-count").textContent = entries.length ? formatNumber(triangleTotal) : "—";
  scanGroups.forEach((group) => updateGroupState(group.id));
  if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();

  if (visible.length) {
    const box = new THREE.Box3().setFromObject(modelsGroup);
    const size = box.getSize(new THREE.Vector3());
    document.querySelector("#scene-size").textContent = `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)}`;
  } else {
    document.querySelector("#scene-size").textContent = "—";
  }
}

function updateSceneReference() {
  const entries = [...models.values()];
  const library = entries.find((entry) => entry.type === "library");
  const referenceSize = library
    ? Math.max(library.size.x, library.size.y, library.size.z)
    : Math.max(...entries.map((entry) => Math.max(entry.size.x, entry.size.y, entry.size.z)), 10);
  const gridSize = Math.max(referenceSize, 10) * 3;
  grid.scale.setScalar(gridSize / 200);
  updateUI();
}

function fitView() {
  const sourceModels = activeModule === "accuracy-assessment" ? assessmentModels : models;
  const visibleMeshes = [...sourceModels.values()].filter((entry) => entry.mesh.visible).map((entry) => entry.mesh);
  if (!visibleMeshes.length) {
    camera.position.set(120, 150, 95);
    controls.target.set(0, 0, 0);
    controls.update();
    return;
  }

  const box = new THREE.Box3();
  visibleMeshes.forEach((mesh) => box.expandByObject(mesh));
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = 1.35 * Math.max(fitHeightDistance, fitWidthDistance, 0.1);
  const direction = new THREE.Vector3(1, 1, 0.72).normalize();

  controls.target.copy(center);
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(distance / 1000, 0.001);
  camera.far = Math.max(distance * 100, 1000);
  camera.updateProjectionMatrix();
  controls.update();
}

function centerLibraryView() {
  const library = activeModule === "accuracy-assessment"
    ? assessmentLibrary
    : [...models.values()].find((entry) => entry.type === "library");
  if (!library) {
    showToast("Load a Scan Body Library file first.", "error");
    return;
  }

  if (!library.mesh.visible) setModelVisibility(library, true);
  const box = new THREE.Box3().setFromObject(library.mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 0.1);
  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = 1.65 * Math.max(fitHeightDistance, fitWidthDistance);
  const direction = new THREE.Vector3(1, 1, 0.72).normalize();

  controls.target.copy(center);
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(distance / 1000, 0.001);
  camera.far = Math.max(distance * 100, 1000);
  camera.updateProjectionMatrix();
  controls.update();
}

function createModelRow(entry) {
  const row = document.createElement("div");
  row.className = "model-row";
  row.dataset.id = entry.id;
  const safeName = escapeHTML(entry.name);
  row.innerHTML = `
    <span class="model-color" style="background:#${entry.color.getHexString()}"></span>
    <span class="model-info">
      <span class="model-name" title="${safeName}">${safeName}</span>
      <span class="model-meta">${modelMetaText(entry)}</span>
    </span>
    <span class="model-actions">
      <button class="model-action visibility-action" type="button" title="Show or hide model">
        <svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>
      </button>
      <button class="model-action remove-action" type="button" title="Remove model">
        <svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3.5 4v5m3-5v5"/></svg>
      </button>
    </span>`;

  row.querySelector(".visibility-action").addEventListener("click", (event) => {
    setModelVisibility(entry, !entry.mesh.visible);
  });
  row.querySelector(".remove-action").addEventListener("click", () => removeModel(entry.id));
  (entry.type === "library" ? libraryList : scansList).append(row);
}

function setModelVisibility(entry, visible) {
  entry.userVisible = visible;
  entry.mesh.visible = visible;
  entry.row?.querySelector(".visibility-action")?.classList.toggle("hidden-model", !visible);
  if (entry.objectRow) {
    entry.objectRow.classList.toggle("object-hidden", !visible);
    entry.objectRow.querySelector("input").checked = visible;
  }
  if (entry.groupId) updateGroupState(entry.groupId);
  updateUI();
}

function createObjectRow(entry) {
  const row = document.createElement("div");
  row.className = "object-row";
  if (entry.groupId) row.classList.add("object-child-row");
  row.dataset.objectId = entry.id;
  const safeName = escapeHTML(entry.name);
  row.innerHTML = `
    <span class="object-swatch" style="color:#${entry.color.getHexString()};background:#${entry.color.getHexString()}"></span>
    <span class="object-copy">
      <span class="object-name" title="${safeName}">${safeName}</span>
      <span class="object-type">${TYPE_CONFIG[entry.type].label}</span>
    </span>
    <label class="visibility-switch" title="Show or hide ${safeName}">
      <input type="checkbox" checked aria-label="Show ${safeName}" />
      <span></span>
    </label>`;
  row.querySelector("input").addEventListener("change", (event) => {
    setModelVisibility(entry, event.currentTarget.checked);
  });
  const parentGroup = entry.groupId ? scanGroups.get(entry.groupId) : null;
  (parentGroup?.childrenContainer || dataObjectsList).append(row);
  return row;
}

function updateGroupState(groupId) {
  const group = scanGroups.get(groupId);
  if (!group) return;
  const children = group.childIds.map((id) => models.get(id)).filter(Boolean);
  const visibleCount = children.filter((entry) => entry.mesh.visible).length;
  const input = group.row.querySelector(".group-visibility-input");
  input.checked = children.length > 0 && visibleCount === children.length;
  input.indeterminate = visibleCount > 0 && visibleCount < children.length;
  group.row.classList.toggle("group-hidden", visibleCount === 0);
  group.row.querySelector(".group-count").textContent = `${children.length} OBJECT${children.length === 1 ? "" : "S"}`;
}

function setGroupVisibility(groupId, visible) {
  const group = scanGroups.get(groupId);
  if (!group) return;
  group.childIds.forEach((id) => {
    const child = models.get(id);
    if (child) setModelVisibility(child, visible);
  });
  updateGroupState(groupId);
}

function createScanGroup({ id, name }) {
  const safeName = escapeHTML(name);
  const scanColor = colorValueForType("scan");
  const wrapper = document.createElement("section");
  wrapper.className = "object-group group-collapsed";
  wrapper.dataset.groupId = id;
  wrapper.innerHTML = `
    <div class="object-group-row">
      <button class="group-toggle" type="button" title="Expand ${safeName}" aria-expanded="false">
        <svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>
      </button>
      <span class="object-swatch" style="color:${scanColor};background:${scanColor}"></span>
      <span class="object-copy">
        <span class="object-name" title="${safeName}">${safeName}</span>
        <span class="object-type"><span class="group-count">0 OBJECTS</span> · ISOLATED GROUP</span>
      </span>
      <label class="visibility-switch group-visibility" title="Show or hide all objects in ${safeName}">
        <input class="group-visibility-input" type="checkbox" checked aria-label="Show all objects in ${safeName}" />
        <span></span>
      </label>
    </div>
    <div class="object-group-children"></div>`;

  const group = {
    id,
    name,
    childIds: [],
    row: wrapper,
    childrenContainer: wrapper.querySelector(".object-group-children"),
  };
  scanGroups.set(id, group);
  dataObjectsList.append(wrapper);

  wrapper.querySelector(".group-toggle").addEventListener("click", (event) => {
    const collapsed = wrapper.classList.toggle("group-collapsed");
    event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
    event.currentTarget.title = `${collapsed ? "Expand" : "Collapse"} ${name}`;
  });
  wrapper.querySelector(".group-visibility-input").addEventListener("change", (event) => {
    setGroupVisibility(id, event.currentTarget.checked);
  });
  return group;
}

function removeScanGroup(groupId) {
  const group = scanGroups.get(groupId);
  if (!group) return;
  group.row.remove();
  scanGroups.delete(groupId);
}

function removeModel(id, refit = true, deleteImportSnapshot = true) {
  const entry = models.get(id);
  if (!entry) return;
  if (deleteImportSnapshot) deleteDataProcessingImportSnapshot(id);
  modelsGroup.remove(entry.mesh);
  disposeLocalOriginAxes(entry);
  disposeFeatureEdges(entry);
  disposeEntryGeometry(entry);
  entry.mesh.material.dispose();
  entry.row?.remove();
  entry.objectRow?.remove();
  models.delete(id);
  if (entry.type === "registered" && entry.registrationFor) {
    const scanbody = models.get(entry.registrationFor);
    if (scanbody) {
      scanbody.registered = false;
      clearDeviationMap(scanbody, scanbody.color || TYPE_CONFIG.scan.color);
      clearAlignmentMarker(scanbody);
    }
  }
  if (entry.groupId) {
    const group = scanGroups.get(entry.groupId);
    if (group) {
      group.childIds = group.childIds.filter((childId) => childId !== id);
      if (group.childIds.length === 0) removeScanGroup(group.id);
      else updateGroupState(group.id);
    }
  }
  if (entry.type === "library" || entry.type === "scan") invalidateFeatureDetection();
  updateSceneReference();
  updateUI();
  if (refit && models.size) fitView();
}

function addModelFromGeometry({ geometry, id, name, bytes, type, isolated = false, groupId = null, libraryType = null }) {
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const color = new THREE.Color(TYPE_CONFIG[type].color);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.58,
    metalness: 0.08,
    wireframe: wireframeToggle.checked,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const box = geometry.boundingBox;
  const size = box.getSize(new THREE.Vector3());
  const triangles = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
  const entry = {
    id,
    name,
    bytes,
    triangles,
    size,
    color,
    type,
    isolated,
    groupId,
    libraryType: type === "library" ? (libraryType || selectedScanbodyLibraryType) : libraryType,
    mesh,
    row: null,
    objectRow: null,
    userVisible: true,
  };
  addLocalOriginAxes(entry);

  models.set(entry.id, entry);
  modelsGroup.add(mesh);
  if (type !== "registered") {
    createModelRow(entry);
    entry.row = (type === "library" ? libraryList : scansList).querySelector(`[data-id="${entry.id}"]`);
  }
  entry.objectRow = createObjectRow(entry);
  if (groupId) {
    const group = scanGroups.get(groupId);
    if (group) {
      group.childIds.push(entry.id);
      updateGroupState(groupId);
    }
  }
  return entry;
}

async function loadUploadedModel(fileRecord, type) {
  const geometry = await fetchSTLGeometry(fileRecord.url);
  let libraryType = null;
  if (type === "library") {
    libraryType = inferScanbodyLibraryTypeFromName(fileRecord.name) || selectedScanbodyLibraryType;
    selectedScanbodyLibraryType = libraryType;
  }
  const entry = addModelFromGeometry({
    geometry,
    id: fileRecord.id,
    name: fileRecord.name,
    bytes: fileRecord.size,
    type,
    libraryType,
  });
  storeDataProcessingImportSnapshot(entry);
  return entry;
}

function isolateGeometry(geometry) {
  const position = geometry.getAttribute("position");
  const triangleCount = position.count / 3;
  const parent = new Int32Array(triangleCount);
  const rank = new Uint8Array(triangleCount);
  const vertexOwners = new Map();

  for (let triangle = 0; triangle < triangleCount; triangle += 1) parent[triangle] = triangle;

  function find(value) {
    let root = value;
    while (parent[root] !== root) root = parent[root];
    while (parent[value] !== value) {
      const next = parent[value];
      parent[value] = root;
      value = next;
    }
    return root;
  }

  function union(first, second) {
    let rootA = find(first);
    let rootB = find(second);
    if (rootA === rootB) return;
    if (rank[rootA] < rank[rootB]) [rootA, rootB] = [rootB, rootA];
    parent[rootB] = rootA;
    if (rank[rootA] === rank[rootB]) rank[rootA] += 1;
  }

  const tolerance = 0.00001;
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const index = triangle * 3 + vertex;
      const key = `${Math.round(position.getX(index) / tolerance)},${Math.round(position.getY(index) / tolerance)},${Math.round(position.getZ(index) / tolerance)}`;
      const owner = vertexOwners.get(key);
      if (owner === undefined) vertexOwners.set(key, triangle);
      else union(triangle, owner);
    }
  }

  const componentTriangles = new Map();
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const root = find(triangle);
    if (!componentTriangles.has(root)) componentTriangles.set(root, []);
    componentTriangles.get(root).push(triangle);
  }

  const components = [...componentTriangles.values()].map((triangles) => {
    const positions = new Float32Array(triangles.length * 9);
    let target = 0;
    triangles.forEach((triangle) => {
      for (let vertex = 0; vertex < 3; vertex += 1) {
        const source = triangle * 3 + vertex;
        positions[target] = position.getX(source);
        positions[target + 1] = position.getY(source);
        positions[target + 2] = position.getZ(source);
        target += 3;
      }
    });
    const component = new THREE.BufferGeometry();
    component.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    component.computeVertexNormals();
    component.computeBoundingBox();
    return component;
  });

  components.sort((first, second) => {
    const firstCenter = first.boundingBox.getCenter(new THREE.Vector3());
    const secondCenter = second.boundingBox.getCenter(new THREE.Vector3());
    return firstCenter.x - secondCenter.x || firstCenter.y - secondCenter.y || firstCenter.z - secondCenter.z;
  });
  return components;
}

function boxDistanceSquared(first, second) {
  const dx = Math.max(0, first.min.x - second.max.x, second.min.x - first.max.x);
  const dy = Math.max(0, first.min.y - second.max.y, second.min.y - first.max.y);
  const dz = Math.max(0, first.min.z - second.max.z, second.min.z - first.max.z);
  return dx * dx + dy * dy + dz * dz;
}

function uniqueVertices(geometry) {
  const position = geometry.getAttribute("position");
  const seen = new Set();
  const vertices = [];
  const precision = 100000;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const key = `${Math.round(x * precision)},${Math.round(y * precision)},${Math.round(z * precision)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    vertices.push([x, y, z]);
  }
  return vertices;
}

function planarTriangleData(geometry) {
  const position = geometry.getAttribute("position");
  const triangleCount = Math.floor(position.count / 3);
  const triangles = [];
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
    const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
    const cross = b.clone().sub(a).cross(c.clone().sub(a));
    const area = cross.length() / 2;
    if (area < 1e-8) continue;
    triangles.push({
      index: triangle,
      normal: cross.normalize(),
      center: a.add(b).add(c).multiplyScalar(1 / 3),
      area,
    });
  }
  return triangles;
}

function planarSeedIndices(triangles) {
  const seedIndices = new Set();
  const regularSeedCount = Math.min(FEATURE_BASE_SEED_COUNT, triangles.length);
  const totalArea = triangles.reduce((sum, triangle) => sum + triangle.area, 0);
  if (totalArea > 0) {
    let cumulativeArea = 0;
    let nextTarget = totalArea / (regularSeedCount + 1);
    const areaStep = totalArea / (regularSeedCount + 1);
    for (let index = 0; index < triangles.length && seedIndices.size < regularSeedCount; index += 1) {
      cumulativeArea += triangles[index].area;
      while (cumulativeArea >= nextTarget && seedIndices.size < regularSeedCount) {
        seedIndices.add(index);
        nextTarget += areaStep;
      }
    }
  }
  return seedIndices;
}

function areaDistributedIndicesFromPool(triangles, eligibleIndices, count) {
  const selected = new Set();
  const cappedCount = Math.min(count, eligibleIndices.length);
  const totalArea = eligibleIndices.reduce((sum, index) => sum + triangles[index].area, 0);
  if (totalArea <= 0 || cappedCount <= 0) return selected;

  let cumulativeArea = 0;
  let nextTarget = totalArea / (cappedCount + 1);
  const areaStep = totalArea / (cappedCount + 1);
  for (let poolIndex = 0; poolIndex < eligibleIndices.length && selected.size < cappedCount; poolIndex += 1) {
    const triangleIndex = eligibleIndices[poolIndex];
    cumulativeArea += triangles[triangleIndex].area;
    while (cumulativeArea >= nextTarget && selected.size < cappedCount) {
      selected.add(triangleIndex);
      nextTarget += areaStep;
    }
  }
  return selected;
}

function lineToLineDistance(firstPoint, firstDirection, secondPoint, secondDirection) {
  const first = firstDirection.clone().normalize();
  const second = secondDirection.clone().normalize();
  const delta = firstPoint.clone().sub(secondPoint);
  const cross = first.clone().cross(second);
  const denominator = cross.length();
  if (denominator < 1e-8) return delta.clone().cross(first).length();
  return Math.abs(delta.dot(cross.normalize()));
}

function featureSeedSelection(geometry, longAxis) {
  const triangles = planarTriangleData(geometry);
  const baseSeedIndices = planarSeedIndices(triangles);
  const activeSeedIndices = new Set(baseSeedIndices);
  const excludedSeedIndices = new Set();
  const addedParallelSeedIndices = new Set();
  if (!triangles.length || !longAxis) {
    return { triangles, activeSeedIndices, excludedSeedIndices, addedParallelSeedIndices };
  }

  const axis = longAxis.clone().normalize();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const axisPoint = box ? box.getCenter(new THREE.Vector3()) : new THREE.Vector3();

  baseSeedIndices.forEach((seedIndex) => {
    const seed = triangles[seedIndex];
    const axisAlignment = Math.abs(seed.normal.dot(axis));
    if (axisAlignment >= FEATURE_AXIS_PARALLEL_DOT) return;
    const distanceToAxis = lineToLineDistance(seed.center, seed.normal, axisPoint, axis);
    if (distanceToAxis >= FEATURE_RADIAL_AXIS_DISTANCE) return;
    activeSeedIndices.delete(seedIndex);
    excludedSeedIndices.add(seedIndex);
  });

  const parallelPool = [];
  triangles.forEach((triangle, index) => {
    if (baseSeedIndices.has(index)) return;
    if (Math.abs(triangle.normal.dot(axis)) < FEATURE_AXIS_PARALLEL_DOT) return;
    parallelPool.push(index);
  });

  areaDistributedIndicesFromPool(triangles, parallelPool, FEATURE_AXIS_PARALLEL_SEED_COUNT)
    .forEach((seedIndex) => {
      addedParallelSeedIndices.add(seedIndex);
      activeSeedIndices.add(seedIndex);
    });

  return { triangles, activeSeedIndices, excludedSeedIndices, addedParallelSeedIndices };
}

function addPlanarSeedArrows(overlay, seedSelection, color) {
  const { triangles, activeSeedIndices, excludedSeedIndices } = seedSelection;
  activeSeedIndices.forEach((seedIndex) => {
    const seed = triangles[seedIndex];
    const arrow = new THREE.ArrowHelper(
      seed.normal.clone().normalize(),
      seed.center,
      0.75,
      color,
      0.18,
      0.09,
    );
    arrow.name = "feature-seed-normal";
    arrow.visible = featureSeedArrowsVisible;
    arrow.renderOrder = 26;
    arrow.traverse((child) => {
      child.renderOrder = 26;
      if (!child.material) return;
      child.material.depthTest = true;
      child.material.depthWrite = false;
      child.material.transparent = true;
      child.material.opacity = 0.85;
    });
    overlay.add(arrow);
  });
  excludedSeedIndices.forEach((seedIndex) => {
    const seed = triangles[seedIndex];
    const arrow = new THREE.ArrowHelper(
      seed.normal.clone().normalize(),
      seed.center,
      0.75,
      0xff2d2d,
      0.18,
      0.09,
    );
    arrow.name = "feature-seed-normal-excluded";
    arrow.visible = featureSeedArrowsVisible;
    arrow.renderOrder = 26;
    arrow.traverse((child) => {
      child.renderOrder = 26;
      if (!child.material) return;
      child.material.depthTest = true;
      child.material.depthWrite = false;
      child.material.transparent = true;
      child.material.opacity = 0.92;
    });
    overlay.add(arrow);
  });
}

function axisFromSeedNormals(normals) {
  if (!normals.length) return null;
  const scatter = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  normals.forEach((normal) => {
    const n = normal.clone().normalize();
    scatter[0][0] += n.x * n.x;
    scatter[0][1] += n.x * n.y;
    scatter[0][2] += n.x * n.z;
    scatter[1][0] += n.y * n.x;
    scatter[1][1] += n.y * n.y;
    scatter[1][2] += n.y * n.z;
    scatter[2][0] += n.z * n.x;
    scatter[2][1] += n.z * n.y;
    scatter[2][2] += n.z * n.z;
  });
  const eigenvectors = symmetricEigenvectors3(scatter);
  return eigenvectors[eigenvectors.length - 1]?.vector.normalize() || null;
}

function estimateLongAxisFromSeedNormals(geometry) {
  const triangles = planarTriangleData(geometry);
  const seedIndices = planarSeedIndices(triangles);
  const seedNormals = [...seedIndices].map((index) => triangles[index]?.normal).filter(Boolean);
  const initialAxis = axisFromSeedNormals(seedNormals);
  if (!initialAxis) return null;
  const sideNormals = seedNormals.filter((normal) => Math.abs(normal.dot(initialAxis)) < 0.35);
  return axisFromSeedNormals(sideNormals.length >= 3 ? sideNormals : seedNormals) || initialAxis;
}

function addLongAxisLine(overlay, geometry, longAxis = null, axisPoint = null) {
  const axis = longAxis || estimateLongAxisFromSeedNormals(geometry);
  if (!axis) return;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const center = axisPoint?.clone() || box.getCenter(new THREE.Vector3());
  const halfLength = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 1);
  const start = center.clone().addScaledVector(axis, -halfLength);
  const end = center.clone().addScaledVector(axis, halfLength);
  const axisGeometry = new THREE.BufferGeometry();
  axisGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
    start.x, start.y, start.z,
    end.x, end.y, end.z,
  ], 3));
  const line = new THREE.Line(
    axisGeometry,
    new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    }),
  );
  line.name = "feature-long-axis";
  line.renderOrder = 27;
  overlay.add(line);
}

function planePatchProjectedPoints(geometry, patch) {
  const position = geometry.getAttribute("position");
  const triangleCount = Math.floor(position.count / 3);
  const cosineTolerance = Math.cos(THREE.MathUtils.degToRad(14));
  const distanceTolerance = 0.3;
  const planeOffset = patch.normal.dot(patch.center);
  const referenceAxis = Math.abs(patch.normal.z) < 0.9
    ? new THREE.Vector3(0, 0, 1)
    : new THREE.Vector3(1, 0, 0);
  const planeX = referenceAxis.clone().cross(patch.normal).normalize();
  const planeY = patch.normal.clone().cross(planeX).normalize();
  const projectedPoints = [];

  function includePoint(point) {
    const local = point.clone().sub(patch.center);
    projectedPoints.push(new THREE.Vector2(local.dot(planeX), local.dot(planeY)));
  }

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
    const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
    const cross = b.clone().sub(a).cross(c.clone().sub(a));
    const area = cross.length() / 2;
    if (area < 1e-8) continue;
    const triangleNormal = cross.normalize();
    const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    if (Math.abs(triangleNormal.dot(patch.normal)) < cosineTolerance) continue;
    if (Math.abs(patch.normal.dot(center) - planeOffset) > distanceTolerance) continue;
    includePoint(a);
    includePoint(b);
    includePoint(c);
  }

  return { projectedPoints, planeX, planeY };
}

function planePatchFrame(geometry, patch) {
  const { projectedPoints, planeX, planeY } = planePatchProjectedPoints(geometry, patch);
  if (!projectedPoints.length) return null;
  const centroid = projectedPoints.reduce(
    (sum, point) => sum.add(point),
    new THREE.Vector2(),
  ).multiplyScalar(1 / projectedPoints.length);
  let covarianceXX = 0;
  let covarianceXY = 0;
  let covarianceYY = 0;
  projectedPoints.forEach((point) => {
    const x = point.x - centroid.x;
    const y = point.y - centroid.y;
    covarianceXX += x * x;
    covarianceXY += x * y;
    covarianceYY += y * y;
  });
  const principalAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceXX - covarianceYY);
  const major2d = new THREE.Vector2(Math.cos(principalAngle), Math.sin(principalAngle)).normalize();
  const minor2d = new THREE.Vector2(-major2d.y, major2d.x);
  let minMajor = Infinity;
  let maxMajor = -Infinity;
  let minMinor = Infinity;
  let maxMinor = -Infinity;
  projectedPoints.forEach((point) => {
    const major = point.dot(major2d);
    const minor = point.dot(minor2d);
    minMajor = Math.min(minMajor, major);
    maxMajor = Math.max(maxMajor, major);
    minMinor = Math.min(minMinor, minor);
    maxMinor = Math.max(maxMinor, minor);
  });
  return {
    majorAxis: planeX.clone().multiplyScalar(major2d.x).addScaledVector(planeY, major2d.y).normalize(),
    minorAxis: planeX.clone().multiplyScalar(minor2d.x).addScaledVector(planeY, minor2d.y).normalize(),
    minMajor,
    maxMajor,
    minMinor,
    maxMinor,
    length: maxMajor - minMajor,
    width: maxMinor - minMinor,
  };
}

function planeRectangleFrameGeometry(geometry, patches) {
  const linePositions = [];

  patches.forEach((patch) => {
    const frame = planePatchFrame(geometry, patch);
    if (!frame) return;
    const lift = Math.max(0.01, Math.sqrt(Math.max(patch.area, 0)) * 0.002);
    const liftedCenter = patch.center.clone().addScaledVector(patch.normal, lift);
    const corners = [
      liftedCenter.clone().addScaledVector(frame.majorAxis, frame.minMajor).addScaledVector(frame.minorAxis, frame.minMinor),
      liftedCenter.clone().addScaledVector(frame.majorAxis, frame.maxMajor).addScaledVector(frame.minorAxis, frame.minMinor),
      liftedCenter.clone().addScaledVector(frame.majorAxis, frame.maxMajor).addScaledVector(frame.minorAxis, frame.maxMinor),
      liftedCenter.clone().addScaledVector(frame.majorAxis, frame.minMajor).addScaledVector(frame.minorAxis, frame.maxMinor),
    ];
    for (let corner = 0; corner < corners.length; corner += 1) {
      const start = corners[corner];
      const end = corners[(corner + 1) % corners.length];
      linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    }
  });

  if (!linePositions.length) return null;
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  return lineGeometry;
}

function planeBorderGeometry(geometry, patches) {
  const position = geometry.getAttribute("position");
  const triangleCount = Math.floor(position.count / 3);
  const cosineTolerance = Math.cos(THREE.MathUtils.degToRad(14));
  const distanceTolerance = 0.3;
  const linePositions = [];

  function vertexKey(point) {
    return `${Math.round(point.x * 100000)},${Math.round(point.y * 100000)},${Math.round(point.z * 100000)}`;
  }

  patches.forEach((patch) => {
    const boundaryEdges = new Map();
    const planeOffset = patch.normal.dot(patch.center);
    const lift = Math.max(0.015, Math.sqrt(Math.max(patch.area, 0)) * 0.003);

    function addBoundaryEdge(first, second) {
      const firstKey = vertexKey(first);
      const secondKey = vertexKey(second);
      const key = firstKey < secondKey ? `${firstKey}|${secondKey}` : `${secondKey}|${firstKey}`;
      const existing = boundaryEdges.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        boundaryEdges.set(key, {
          first: first.clone().addScaledVector(patch.normal, lift),
          second: second.clone().addScaledVector(patch.normal, lift),
          count: 1,
        });
      }
    }

    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
      const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
      const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
      const cross = b.clone().sub(a).cross(c.clone().sub(a));
      const area = cross.length() / 2;
      if (area < 1e-8) continue;
      const triangleNormal = cross.normalize();
      const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
      if (Math.abs(triangleNormal.dot(patch.normal)) < cosineTolerance) continue;
      if (Math.abs(patch.normal.dot(center) - planeOffset) > distanceTolerance) continue;
      addBoundaryEdge(a, b);
      addBoundaryEdge(b, c);
      addBoundaryEdge(c, a);
    }

    boundaryEdges.forEach((edge) => {
      if (edge.count !== 1) return;
      linePositions.push(
        edge.first.x, edge.first.y, edge.first.z,
        edge.second.x, edge.second.y, edge.second.z,
      );
    });
  });

  if (!linePositions.length) return null;
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  return lineGeometry;
}

function classifyFeaturePlanes(geometry, patches, longAxis) {
  if (!longAxis) return { topRing: null, sideFace: null };
  const axis = longAxis.clone().normalize();
  let topRing = null;
  let sideFace = null;

  patches.forEach((patch) => {
    const frame = planePatchFrame(geometry, patch);
    if (!frame) return;
    if (frame.length < FEATURE_PLANE_MIN_FRAME_SIZE || frame.width < FEATURE_PLANE_MIN_FRAME_SIZE) return;
    const shape = planePatchShapeMetrics(geometry, patch);
    const normalAlignment = Math.abs(patch.normal.dot(axis));
    const majorAxisAlignment = Math.abs(frame.majorAxis.dot(axis));
    const longerSide = Math.max(frame.length, frame.width);
    const shorterSide = Math.min(frame.length, frame.width);
    const frameAspect = longerSide / Math.max(shorterSide, 1e-6);

    if (normalAlignment >= 0.85) {
      const topScore = patch.area
        * (1 + normalAlignment)
        * (1 + shape.annularScore / Math.max(patch.area, 1e-6));
      if (!topRing || topScore > topRing.score) topRing = { patch, score: topScore };
    }

    if (normalAlignment <= 0.25 && majorAxisAlignment >= 0.75 && shape.fillRatio >= 0.45) {
      const sideScore = patch.area
        * (1 + (1 - normalAlignment))
        * (1 + majorAxisAlignment)
        * shape.fillRatio
        * Math.min(frameAspect, 4);
      if (!sideFace || sideScore > sideFace.score) sideFace = { patch, score: sideScore };
    }
  });

  return {
    topRing: topRing?.patch || null,
    sideFace: sideFace?.patch || null,
  };
}

function weightedAxisFromTriangleNormals(triangles) {
  if (!triangles.length) return null;
  const scatter = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  triangles.forEach((triangle) => {
    const n = triangle.normal.clone().normalize();
    const weight = triangle.area;
    scatter[0][0] += weight * n.x * n.x;
    scatter[0][1] += weight * n.x * n.y;
    scatter[0][2] += weight * n.x * n.z;
    scatter[1][0] += weight * n.y * n.x;
    scatter[1][1] += weight * n.y * n.y;
    scatter[1][2] += weight * n.y * n.z;
    scatter[2][0] += weight * n.z * n.x;
    scatter[2][1] += weight * n.z * n.y;
    scatter[2][2] += weight * n.z * n.z;
  });
  const eigenvectors = symmetricEigenvectors3(scatter);
  return eigenvectors[eigenvectors.length - 1]?.vector.normalize() || null;
}

function weightedMeanPoint(triangles) {
  const totalArea = triangles.reduce((sum, triangle) => sum + triangle.area, 0);
  if (totalArea <= 0) return new THREE.Vector3();
  return triangles.reduce(
    (sum, triangle) => sum.addScaledVector(triangle.center, triangle.area),
    new THREE.Vector3(),
  ).multiplyScalar(1 / totalArea);
}

function weightedMeanNormal(triangles, referenceNormal) {
  const reference = referenceNormal.clone().normalize();
  const total = new THREE.Vector3();
  let totalArea = 0;
  triangles.forEach((triangle) => {
    const normal = triangle.normal.clone().normalize();
    if (normal.dot(reference) < 0) normal.negate();
    total.addScaledVector(normal, triangle.area);
    totalArea += triangle.area;
  });
  if (totalArea <= 0 || total.lengthSq() < 1e-12) return reference.clone();
  return total.normalize();
}

function weightedPercentile(values, percentileValue) {
  const sorted = values
    .filter((record) => Number.isFinite(record.value) && record.weight > 0)
    .sort((first, second) => first.value - second.value);
  const totalWeight = sorted.reduce((sum, record) => sum + record.weight, 0);
  if (!sorted.length || totalWeight <= 0) return 0;
  const target = totalWeight * percentileValue;
  let cumulative = 0;
  for (const record of sorted) {
    cumulative += record.weight;
    if (cumulative >= target) return record.value;
  }
  return sorted[sorted.length - 1].value;
}

function axisBasis(axis) {
  const zAxis = axis.clone().normalize();
  const reference = Math.abs(zAxis.z) < 0.9
    ? new THREE.Vector3(0, 0, 1)
    : new THREE.Vector3(1, 0, 0);
  const xAxis = reference.clone().cross(zAxis).normalize();
  const yAxis = zAxis.clone().cross(xAxis).normalize();
  return { xAxis, yAxis, zAxis };
}

function solveSymmetric3(matrix, vector) {
  const augmented = [
    [matrix[0][0], matrix[0][1], matrix[0][2], vector[0]],
    [matrix[1][0], matrix[1][1], matrix[1][2], vector[1]],
    [matrix[2][0], matrix[2][1], matrix[2][2], vector[2]],
  ];

  for (let column = 0; column < 3; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 3; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    if (Math.abs(augmented[pivot][column]) < 1e-10) return null;
    if (pivot !== column) [augmented[pivot], augmented[column]] = [augmented[column], augmented[pivot]];
    const divisor = augmented[column][column];
    for (let index = column; index < 4; index += 1) augmented[column][index] /= divisor;
    for (let row = 0; row < 3; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let index = column; index < 4; index += 1) {
        augmented[row][index] -= factor * augmented[column][index];
      }
    }
  }

  return [augmented[0][3], augmented[1][3], augmented[2][3]];
}

function estimateStraumannSraOldAxis(triangles) {
  let axis = weightedAxisFromTriangleNormals(triangles);
  if (!axis) return null;
  const wallMaxDot = Math.cos(THREE.MathUtils.degToRad(SRA_OLD_WALL_NORMAL_MIN_ANGLE_DEGREES));

  for (let iteration = 0; iteration < SRA_OLD_AXIS_ITERATIONS; iteration += 1) {
    const wallTriangles = triangles.filter((triangle) => Math.abs(triangle.normal.dot(axis)) < wallMaxDot);
    if (wallTriangles.length < 3) break;
    const nextAxis = weightedAxisFromTriangleNormals(wallTriangles);
    if (!nextAxis) break;
    if (nextAxis.dot(axis) < 0) nextAxis.negate();
    axis = nextAxis;
  }

  return axis.normalize();
}

function fitStraumannSraOldAxisCircle(triangles, axis) {
  const wallMaxDot = Math.cos(THREE.MathUtils.degToRad(SRA_OLD_WALL_NORMAL_MIN_ANGLE_DEGREES));
  const wallTriangles = triangles.filter((triangle) => Math.abs(triangle.normal.dot(axis)) < wallMaxDot);
  const fitTriangles = wallTriangles.length >= 3 ? wallTriangles : triangles;
  const origin = weightedMeanPoint(fitTriangles);
  const { xAxis, yAxis } = axisBasis(axis);
  const normalMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const normalVector = [0, 0, 0];

  fitTriangles.forEach((triangle) => {
    const local = triangle.center.clone().sub(origin);
    const x = local.dot(xAxis);
    const y = local.dot(yAxis);
    const row = [2 * x, 2 * y, 1];
    const rhs = x * x + y * y;
    const weight = triangle.area;
    for (let r = 0; r < 3; r += 1) {
      normalVector[r] += weight * row[r] * rhs;
      for (let c = 0; c < 3; c += 1) normalMatrix[r][c] += weight * row[r] * row[c];
    }
  });

  const solution = solveSymmetric3(normalMatrix, normalVector);
  if (!solution) {
    return {
      center: origin,
      radius: 0,
      wallTriangles: fitTriangles,
    };
  }

  const [centerX, centerY, constant] = solution;
  return {
    center: origin.clone().addScaledVector(xAxis, centerX).addScaledVector(yAxis, centerY),
    radius: Math.sqrt(Math.max(0, constant + centerX * centerX + centerY * centerY)),
    wallTriangles: fitTriangles,
  };
}

function orientStraumannSraOldAxis(triangles, axis, center) {
  const capTriangles = triangles.filter((triangle) => Math.abs(triangle.normal.dot(axis)) > SRA_OLD_CAP_AXIS_DOT);
  if (!capTriangles.length) return axis.clone().normalize();
  const totalArea = capTriangles.reduce((sum, triangle) => sum + triangle.area, 0);
  const meanHeight = capTriangles.reduce((sum, triangle) => (
    sum + triangle.area * triangle.center.clone().sub(center).dot(axis)
  ), 0) / Math.max(totalArea, 1e-6);
  const oriented = axis.clone().normalize();
  if (meanHeight < 0) oriented.negate();
  return oriented;
}

function fitStraumannSraOldTopPlane(triangles, axis, center) {
  const topNormalDot = Math.cos(THREE.MathUtils.degToRad(SRA_OLD_TOP_NORMAL_ANGLE_DEGREES));
  const heights = triangles.map((triangle) => triangle.center.clone().sub(center).dot(axis));
  const maximumHeight = Math.max(...heights);
  const topTriangles = triangles.filter((triangle, index) => (
    Math.abs(triangle.normal.dot(axis)) > topNormalDot
    && heights[index] > maximumHeight - SRA_OLD_TOP_HEIGHT_WINDOW
  ));
  if (!topTriangles.length) return { patch: null, topTriangles, maximumHeight };
  const normal = weightedMeanNormal(topTriangles, axis);
  const point = weightedMeanPoint(topTriangles);
  const area = topTriangles.reduce((sum, triangle) => sum + triangle.area, 0);
  return {
    patch: {
      normal,
      center: point,
      offset: normal.dot(point),
      area,
      inlierFaceIndices: topTriangles.map((triangle) => triangle.index),
    },
    topTriangles,
    maximumHeight,
  };
}

function estimateStraumannSraOldHoleRadius(topTriangles, axis, center) {
  if (!topTriangles.length) return 0;
  const { xAxis, yAxis } = axisBasis(axis);
  const radialRecords = topTriangles.map((triangle) => {
    const local = triangle.center.clone().sub(center);
    const x = local.dot(xAxis);
    const y = local.dot(yAxis);
    return {
      value: Math.sqrt(x * x + y * y),
      weight: triangle.area,
    };
  });
  return weightedPercentile(radialRecords, SRA_OLD_HOLE_RADIUS_PERCENTILE);
}

function detectStraumannSraOldBevel(triangles, axis, center, maximumHeight) {
  const normalCosine = Math.cos(THREE.MathUtils.degToRad(SRA_OLD_BEVEL_RANSAC_NORMAL_ANGLE_DEGREES));
  const candidates = triangles.filter((triangle) => {
    const axisDot = triangle.normal.dot(axis);
    const height = triangle.center.clone().sub(center).dot(axis);
    return axisDot > SRA_OLD_BEVEL_MIN_AXIS_DOT
      && axisDot < SRA_OLD_BEVEL_MAX_AXIS_DOT
      && height > maximumHeight - SRA_OLD_BEVEL_TOP_WINDOW;
  });
  if (!candidates.length) return null;

  let bestConsensus = null;
  candidates.forEach((hypothesis) => {
    const hypothesisNormal = hypothesis.normal.clone().normalize();
    const hypothesisPoint = hypothesis.center;
    const inliers = [];
    let area = 0;
    candidates.forEach((candidate) => {
      if (candidate.normal.dot(hypothesisNormal) < normalCosine) return;
      const distance = Math.abs(candidate.center.clone().sub(hypothesisPoint).dot(hypothesisNormal));
      if (distance > SRA_OLD_BEVEL_RANSAC_DISTANCE) return;
      inliers.push(candidate);
      area += candidate.area;
    });
    if (!bestConsensus || area > bestConsensus.area) {
      bestConsensus = { inliers, area, referenceNormal: hypothesisNormal };
    }
  });

  if (!bestConsensus?.inliers.length) return null;
  const normal = weightedMeanNormal(bestConsensus.inliers, bestConsensus.referenceNormal);
  const point = weightedMeanPoint(bestConsensus.inliers);
  const totalArea = bestConsensus.inliers.reduce((sum, triangle) => sum + triangle.area, 0);
  const squaredDistance = bestConsensus.inliers.reduce((sum, triangle) => {
    const distance = triangle.center.clone().sub(point).dot(normal);
    return sum + triangle.area * distance * distance;
  }, 0);
  const planarRms = Math.sqrt(squaredDistance / Math.max(totalArea, 1e-6));
  if (planarRms > SRA_OLD_BEVEL_PLANAR_RMS_MAX) {
    return {
      rejected: true,
      planarRms,
      candidateCount: candidates.length,
      inlierFaceIndices: bestConsensus.inliers.map((triangle) => triangle.index),
    };
  }

  const axisDot = THREE.MathUtils.clamp(Math.abs(normal.dot(axis)), 0, 1);
  return {
    patch: {
      normal,
      center: point,
      offset: normal.dot(point),
      area: totalArea,
      inlierFaceIndices: bestConsensus.inliers.map((triangle) => triangle.index),
      angleToAxis: THREE.MathUtils.radToDeg(Math.asin(axisDot)),
      angleToTopPlane: THREE.MathUtils.radToDeg(Math.acos(axisDot)),
      planarRms,
    },
    planarRms,
    candidateCount: candidates.length,
  };
}

function detectStraumannSraOldReferenceFeatures(geometry) {
  const triangles = planarTriangleData(geometry);
  if (!triangles.length) return null;
  const initialAxis = estimateStraumannSraOldAxis(triangles);
  if (!initialAxis) return null;
  const initialCircle = fitStraumannSraOldAxisCircle(triangles, initialAxis);
  const axis = orientStraumannSraOldAxis(triangles, initialAxis, initialCircle.center);
  const circle = fitStraumannSraOldAxisCircle(triangles, axis);
  const topPlane = fitStraumannSraOldTopPlane(triangles, axis, circle.center);
  const holeRadius = estimateStraumannSraOldHoleRadius(topPlane.topTriangles, axis, circle.center);
  const bevel = detectStraumannSraOldBevel(triangles, axis, circle.center, topPlane.maximumHeight);

  return {
    axis,
    center: circle.center,
    radius: circle.radius,
    topPlane: topPlane.patch,
    holeRadius,
    bevel,
    triangles,
  };
}

function applyStraumannSraOldFeaturePlanes(entry) {
  disposeFeatureEdges(entry);
  const sourceGeometry = entry.deviationBaseGeometry || entry.mesh.geometry;
  const result = detectStraumannSraOldReferenceFeatures(sourceGeometry);
  if (!result) return false;

  entry.featurePlanes = {
    topRing: clonePlanePatch(result.topPlane),
    sideFace: clonePlanePatch(result.bevel?.patch),
    longAxis: result.axis.clone(),
    longAxisCenter: result.center.clone(),
    radius: result.radius,
    holeRadius: result.holeRadius,
    facetNormal: result.bevel?.patch?.normal.clone() || null,
    facetPoint: result.bevel?.patch?.center.clone() || null,
    facetAngleToAxis: result.bevel?.patch?.angleToAxis ?? null,
    facetAngleToTopPlane: result.bevel?.patch?.angleToTopPlane ?? null,
    facetPlanarRms: result.bevel?.planarRms ?? null,
    facetInlierFaceIndices: result.bevel?.patch?.inlierFaceIndices || result.bevel?.inlierFaceIndices || [],
    facetRejected: Boolean(result.bevel?.rejected),
  };

  const patches = [result.topPlane, result.bevel?.patch].filter(Boolean);
  const frameGeometry = planeRectangleFrameGeometry(sourceGeometry, patches);
  const borderGeometry = planeBorderGeometry(sourceGeometry, patches);
  const color = entry.type === "library" ? 0xffffff : 0xd9ff43;
  const seedSelection = featureSeedSelection(sourceGeometry, result.axis);
  const overlay = new THREE.Group();
  overlay.name = "feature-plane-overlay";
  addPlanarSeedArrows(overlay, seedSelection, 0x35e66f);
  addLongAxisLine(overlay, sourceGeometry, result.axis, result.center);
  if (frameGeometry) {
    const frameLines = new THREE.LineSegments(
      frameGeometry,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
        depthWrite: false,
      }),
    );
    frameLines.name = "feature-plane-frames";
    frameLines.renderOrder = 24;
    overlay.add(frameLines);
  }
  if (borderGeometry) {
    const borderLines = new THREE.LineSegments(
      borderGeometry,
      new THREE.LineBasicMaterial({
        color: 0xff4dff,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
      }),
    );
    borderLines.name = "feature-plane-borders";
    borderLines.renderOrder = 25;
    overlay.add(borderLines);
  }
  entry.mesh.add(overlay);
  entry.featureEdges = overlay;
  entry.featureEdgesDetected = Boolean(entry.featurePlanes.topRing && entry.featurePlanes.longAxis);
  return entry.featureEdgesDetected;
}

function clonePlanePatch(patch) {
  if (!patch) return null;
  const clone = {
    normal: patch.normal.clone(),
    center: patch.center.clone(),
    offset: patch.offset,
    area: patch.area,
  };
  if (patch.inlierFaceIndices) clone.inlierFaceIndices = patch.inlierFaceIndices.slice();
  if (Number.isFinite(patch.angleToAxis)) clone.angleToAxis = patch.angleToAxis;
  if (Number.isFinite(patch.angleToTopPlane)) clone.angleToTopPlane = patch.angleToTopPlane;
  if (Number.isFinite(patch.planarRms)) clone.planarRms = patch.planarRms;
  return clone;
}

function applyFeaturePlanes(entry, classifier = classifyFeaturePlanes) {
  disposeFeatureEdges(entry);
  const sourceGeometry = entry.deviationBaseGeometry || entry.mesh.geometry;
  const longAxis = estimateLongAxisFromSeedNormals(sourceGeometry);
  const seedSelection = featureSeedSelection(sourceGeometry, longAxis);
  const candidates = detectPlanarPatches(
    sourceGeometry,
    FEATURE_PLANE_CLASSIFIER_CANDIDATES,
    seedSelection.activeSeedIndices,
    seedSelection.triangles,
  );
  const featurePlanes = classifier(sourceGeometry, candidates, longAxis);
  entry.featurePlanes = {
    topRing: clonePlanePatch(featurePlanes.topRing),
    sideFace: clonePlanePatch(featurePlanes.sideFace),
    longAxis: longAxis?.clone() || null,
  };
  const patches = [featurePlanes.topRing, featurePlanes.sideFace].filter(Boolean);
  const frameGeometry = planeRectangleFrameGeometry(sourceGeometry, patches);
  const borderGeometry = planeBorderGeometry(sourceGeometry, patches);
  const color = entry.type === "library" ? 0xffffff : 0xd9ff43;
  const overlay = new THREE.Group();
  overlay.name = "feature-plane-overlay";
  addPlanarSeedArrows(overlay, seedSelection, 0x35e66f);
  addLongAxisLine(overlay, sourceGeometry, longAxis);
  if (frameGeometry) {
    const frameLines = new THREE.LineSegments(
      frameGeometry,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.96,
        depthTest: false,
        depthWrite: false,
      }),
    );
    frameLines.name = "feature-plane-frame";
    overlay.add(frameLines);
  }
  if (borderGeometry) {
    const borderLines = new THREE.LineSegments(
      borderGeometry,
      new THREE.LineBasicMaterial({
        color: 0xff35ff,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
      }),
    );
    borderLines.name = "feature-plane-border";
    overlay.add(borderLines);
  }
  overlay.traverse((child) => {
    if (!child.isLineSegments) return;
    child.renderOrder = 25;
  });
  if (!overlay.children.length) {
    entry.featureEdgesDetected = true;
    return 0;
  }
  entry.mesh.add(overlay);
  entry.featureEdges = overlay;
  entry.featureEdgesDetected = true;
  return patches.length;
}

function componentsAreClose(first, second, distance) {
  const distanceSquared = distance * distance;
  if (boxDistanceSquared(first.boundingBox, second.boundingBox) > distanceSquared) return false;

  const firstVertices = uniqueVertices(first);
  const secondVertices = uniqueVertices(second);
  const source = firstVertices.length <= secondVertices.length ? firstVertices : secondVertices;
  const target = firstVertices.length <= secondVertices.length ? secondVertices : firstVertices;
  const cells = new Map();

  target.forEach(([x, y, z]) => {
    const key = `${Math.floor(x / distance)},${Math.floor(y / distance)},${Math.floor(z / distance)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push([x, y, z]);
  });

  for (const [x, y, z] of source) {
    const cellX = Math.floor(x / distance);
    const cellY = Math.floor(y / distance);
    const cellZ = Math.floor(z / distance);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          const candidates = cells.get(`${cellX + dx},${cellY + dy},${cellZ + dz}`);
          if (!candidates) continue;
          for (const [otherX, otherY, otherZ] of candidates) {
            const deltaX = x - otherX;
            const deltaY = y - otherY;
            const deltaZ = z - otherZ;
            if (deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ <= distanceSquared) return true;
          }
        }
      }
    }
  }
  return false;
}

function mergeGeometries(geometries) {
  const totalValues = geometries.reduce(
    (sum, geometry) => sum + geometry.getAttribute("position").array.length,
    0,
  );
  const positions = new Float32Array(totalValues);
  let offset = 0;

  geometries.forEach((geometry) => {
    const values = geometry.getAttribute("position").array;
    positions.set(values, offset);
    offset += values.length;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  return merged;
}

function groupNearbyComponents(components, distance = 5) {
  const parent = components.map((_, index) => index);

  function find(value) {
    if (parent[value] !== value) parent[value] = find(parent[value]);
    return parent[value];
  }

  function union(first, second) {
    const rootA = find(first);
    const rootB = find(second);
    if (rootA !== rootB) parent[rootB] = rootA;
  }

  for (let first = 0; first < components.length; first += 1) {
    for (let second = first + 1; second < components.length; second += 1) {
      if (componentsAreClose(components[first], components[second], distance)) union(first, second);
    }
  }

  const groups = new Map();
  components.forEach((component, index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(component);
  });

  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0];
    const merged = mergeGeometries(group);
    group.forEach((geometry) => geometry.dispose());
    return merged;
  });
}

function geometryMaxDimension(geometry) {
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  return Math.max(size.x, size.y, size.z);
}

function filterSmallComponents(components, minimumDimension = 3) {
  const kept = [];
  let removed = 0;
  components.forEach((component) => {
    if (geometryMaxDimension(component) >= minimumDimension) {
      kept.push(component);
      return;
    }
    component.dispose();
    removed += 1;
  });
  return { kept, removed };
}

function cropGeometryToTopRingDistance(geometry, topRing, maximumDistance = SCANBODY_CROP_TOP_RING_DISTANCE) {
  const position = geometry.getAttribute("position");
  const triangleCount = Math.floor(position.count / 3);
  const planeNormal = topRing.normal.clone().normalize();
  const planeOffset = planeNormal.dot(topRing.center);
  const positions = [];

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
    const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
    const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    const distance = Math.abs(planeNormal.dot(center) - planeOffset);
    if (distance > maximumDistance) continue;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  if (!positions.length || positions.length === position.array.length) return null;
  const croppedGeometry = new THREE.BufferGeometry();
  croppedGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  croppedGeometry.computeVertexNormals();
  croppedGeometry.computeBoundingBox();
  return croppedGeometry;
}

function refreshModelGeometryMetadata(entry) {
  entry.mesh.geometry.computeBoundingBox();
  entry.mesh.geometry.computeVertexNormals();
  entry.size = entry.mesh.geometry.boundingBox.getSize(new THREE.Vector3());
  entry.triangles = entry.mesh.geometry.getAttribute("position").count / 3;
  entry.bytes = 84 + entry.triangles * 50;
  entry.row.querySelector(".model-meta").textContent = modelMetaText(entry);
}

function replaceEntryGeometry(entry, geometry) {
  disposeFeatureEdges(entry);
  clearDeviationMap(entry, entry.color || TYPE_CONFIG[entry.type].color);
  clearAlignmentMarker(entry);
  const previousGeometry = entry.mesh.geometry;
  entry.mesh.geometry = geometry;
  previousGeometry.dispose();
  refreshModelGeometryMetadata(entry);
}

function sampleGeometryPoints(geometry, maximum = 900) {
  const position = geometry.getAttribute("position");
  const step = Math.max(1, Math.floor(position.count / maximum));
  const points = [];
  for (let index = 0; index < position.count; index += step) {
    points.push(new THREE.Vector3(position.getX(index), position.getY(index), position.getZ(index)));
  }
  return points;
}

function pointCentroid(points) {
  const center = new THREE.Vector3();
  points.forEach((point) => center.add(point));
  return center.multiplyScalar(1 / Math.max(points.length, 1));
}

function buildKdTree(points, indices = points.map((_, index) => index), depth = 0) {
  if (!indices.length) return null;
  const axis = depth % 3;
  const coordinate = ["x", "y", "z"][axis];
  indices.sort((first, second) => points[first][coordinate] - points[second][coordinate]);
  const middle = Math.floor(indices.length / 2);
  return {
    index: indices[middle],
    axis,
    left: buildKdTree(points, indices.slice(0, middle), depth + 1),
    right: buildKdTree(points, indices.slice(middle + 1), depth + 1),
  };
}

function nearestPoint(tree, points, query, best = { index: -1, distanceSquared: Infinity }) {
  if (!tree) return best;
  const point = points[tree.index];
  const distanceSquared = point.distanceToSquared(query);
  if (distanceSquared < best.distanceSquared) best = { index: tree.index, distanceSquared };
  const coordinate = ["x", "y", "z"][tree.axis];
  const difference = query[coordinate] - point[coordinate];
  const near = difference < 0 ? tree.left : tree.right;
  const far = difference < 0 ? tree.right : tree.left;
  best = nearestPoint(near, points, query, best);
  if (difference * difference < best.distanceSquared) best = nearestPoint(far, points, query, best);
  return best;
}

function bestRigidTransform(source, target) {
  const sourceCenter = pointCentroid(source);
  const targetCenter = pointCentroid(target);
  const s = Array.from({ length: 3 }, () => [0, 0, 0]);

  for (let index = 0; index < source.length; index += 1) {
    const p = source[index].clone().sub(sourceCenter);
    const q = target[index].clone().sub(targetCenter);
    s[0][0] += p.x * q.x; s[0][1] += p.x * q.y; s[0][2] += p.x * q.z;
    s[1][0] += p.y * q.x; s[1][1] += p.y * q.y; s[1][2] += p.y * q.z;
    s[2][0] += p.z * q.x; s[2][1] += p.z * q.y; s[2][2] += p.z * q.z;
  }

  const [sxx, sxy, sxz] = s[0];
  const [syx, syy, syz] = s[1];
  const [szx, szy, szz] = s[2];
  const matrix = [
    [sxx + syy + szz, syz - szy, szx - sxz, sxy - syx],
    [syz - szy, sxx - syy - szz, sxy + syx, szx + sxz],
    [szx - sxz, sxy + syx, -sxx + syy - szz, syz + szy],
    [sxy - syx, szx + sxz, syz + szy, -sxx - syy + szz],
  ];
  const shift = matrix.reduce(
    (maximum, row) => Math.max(maximum, row.reduce((sum, value) => sum + Math.abs(value), 0)),
    0,
  );
  for (let index = 0; index < 4; index += 1) matrix[index][index] += shift;
  let eigenvector = [1, 0, 0, 0];
  for (let iteration = 0; iteration < 40; iteration += 1) {
    const next = matrix.map((row) => row.reduce((sum, value, index) => sum + value * eigenvector[index], 0));
    const length = Math.hypot(...next) || 1;
    eigenvector = next.map((value) => value / length);
  }

  const rotation = new THREE.Quaternion(eigenvector[1], eigenvector[2], eigenvector[3], eigenvector[0]).normalize();
  const translation = targetCenter.clone().sub(sourceCenter.clone().applyQuaternion(rotation));
  return new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1));
}

function detectPlanarPatches(geometry, maximumPatches = 5, seedIndicesOverride = null, trianglesOverride = null) {
  const triangles = trianglesOverride || planarTriangleData(geometry);
  if (!triangles.length) return [];

  const seedIndices = seedIndicesOverride || planarSeedIndices(triangles);
  const cosineTolerance = Math.cos(THREE.MathUtils.degToRad(14));
  const distanceTolerance = 0.5;
  const candidates = [];

  seedIndices.forEach((seedIndex) => {
    const seed = triangles[seedIndex];
    const planeOffset = seed.normal.dot(seed.center);
    let area = 0;
    const center = new THREE.Vector3();
    const normal = new THREE.Vector3();
    triangles.forEach((triangle) => {
      const alignment = triangle.normal.dot(seed.normal);
      if (Math.abs(alignment) < cosineTolerance) return;
      if (Math.abs(seed.normal.dot(triangle.center) - planeOffset) > distanceTolerance) return;
      area += triangle.area;
      center.addScaledVector(triangle.center, triangle.area);
      normal.addScaledVector(triangle.normal, triangle.area * Math.sign(alignment));
    });
    if (area <= 0) return;
    center.multiplyScalar(1 / area);
    normal.normalize();
    const offset = normal.dot(center);
    candidates.push({ normal, center, offset, area });
  });

  const patches = [];
  candidates.sort((first, second) => second.area - first.area).forEach((candidate) => {
    const duplicate = patches.some((patch) => (
      Math.abs(patch.normal.dot(candidate.normal)) > Math.cos(THREE.MathUtils.degToRad(10))
      && Math.abs(Math.abs(patch.offset) - Math.abs(candidate.offset)) < 0.6
    ));
    if (!duplicate && patches.length < maximumPatches) patches.push(candidate);
  });
  return patches;
}

function planePatchShapeMetrics(geometry, patch) {
  const position = geometry.getAttribute("position");
  const triangleCount = Math.floor(position.count / 3);
  const normal = patch.normal.clone().normalize();
  const reference = Math.abs(normal.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const u = reference.clone().cross(normal).normalize();
  const v = normal.clone().cross(u).normalize();
  const cosineTolerance = Math.cos(THREE.MathUtils.degToRad(14));
  const distanceTolerance = 0.3;
  const planeOffset = patch.normal.dot(patch.center);
  let area = 0;
  let uu = 0; let uv = 0; let vv = 0;
  let minU = Infinity; let maxU = -Infinity;
  let minV = Infinity; let maxV = -Infinity;

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
    const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
    const cross = b.clone().sub(a).cross(c.clone().sub(a));
    const triangleArea = cross.length() / 2;
    if (triangleArea < 1e-8) continue;
    const triangleNormal = cross.normalize();
    const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    if (Math.abs(triangleNormal.dot(patch.normal)) < cosineTolerance) continue;
    if (Math.abs(patch.normal.dot(center) - planeOffset) > distanceTolerance) continue;
    area += triangleArea;
    [a, b, c].forEach((point) => {
      const delta = point.clone().sub(patch.center);
      const x = delta.dot(u);
      const y = delta.dot(v);
      uu += x * x * triangleArea / 3;
      uv += x * y * triangleArea / 3;
      vv += y * y * triangleArea / 3;
      minU = Math.min(minU, x);
      maxU = Math.max(maxU, x);
      minV = Math.min(minV, y);
      maxV = Math.max(maxV, y);
    });
  }

  if (area <= 0) {
    return {
      aspect: 1,
      fillRatio: 0,
      annularScore: 0,
      rectangularScore: 0,
      u,
      v,
      bounds: { minU: 0, maxU: 0, minV: 0, maxV: 0 },
    };
  }
  uu /= area;
  uv /= area;
  vv /= area;
  const trace = uu + vv;
  const determinant = uu * vv - uv * uv;
  const discriminant = Math.sqrt(Math.max(0, trace * trace / 4 - determinant));
  const major = Math.max(trace / 2 + discriminant, 1e-8);
  const minor = Math.max(trace / 2 - discriminant, 1e-8);
  const aspect = Math.sqrt(major / minor);
  const boundsArea = Math.max((maxU - minU) * (maxV - minV), 1e-8);
  const fillRatio = THREE.MathUtils.clamp(area / boundsArea, 0, 1);
  const compactness = 1 / (1 + Math.abs(Math.log(aspect)));
  const annularScore = area * compactness * (1 + Math.max(0, 0.92 - fillRatio));
  const rectangularScore = area * Math.max(1, aspect) * fillRatio;
  return {
    aspect,
    fillRatio,
    annularScore,
    rectangularScore,
    u,
    v,
    bounds: { minU, maxU, minV, maxV },
  };
}

function refineRegistration(sourcePoints, targetPoints, initialMatrix) {
  const targetTree = buildKdTree(targetPoints);
  const transform = initialMatrix.clone();
  let previousError = Infinity;

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const matches = sourcePoints.map((source) => {
      const transformed = source.clone().applyMatrix4(transform);
      const nearest = nearestPoint(targetTree, targetPoints, transformed);
      return { source: transformed, target: targetPoints[nearest.index], distanceSquared: nearest.distanceSquared };
    });
    matches.sort((first, second) => first.distanceSquared - second.distanceSquared);
    const retained = matches.slice(0, Math.max(20, Math.floor(matches.length * 0.8)));
    const delta = bestRigidTransform(
      retained.map((match) => match.source),
      retained.map((match) => match.target),
    );
    transform.premultiply(delta);
    const error = Math.sqrt(retained.reduce((sum, match) => sum + match.distanceSquared, 0) / retained.length);
    if (Math.abs(previousError - error) < 0.0001) break;
    previousError = error;
  }

  const finalError = Math.sqrt(sourcePoints.reduce((sum, source) => {
    const transformed = source.clone().applyMatrix4(transform);
    return sum + nearestPoint(targetTree, targetPoints, transformed).distanceSquared;
  }, 0) / sourcePoints.length);
  return { matrix: transform, error: finalError };
}

function scoreInitialRegistration(sourcePoints, targetPoints, matrix) {
  const targetTree = buildKdTree(targetPoints);
  const distances = sourcePoints.map((source) => {
    const transformed = source.clone().applyMatrix4(matrix);
    return nearestPoint(targetTree, targetPoints, transformed).distanceSquared;
  }).sort((first, second) => first - second);
  const retained = distances.slice(0, Math.max(20, Math.floor(distances.length * 0.8)));
  return Math.sqrt(retained.reduce((sum, distance) => sum + distance, 0) / retained.length);
}

function hasRequiredAlignmentFeatures(entry) {
  return Boolean(
    entry.featureEdgesDetected
    && entry.featurePlanes?.topRing
    && entry.featurePlanes?.sideFace
    && entry.featurePlanes?.longAxis,
  );
}

function detectedFeatureFrameVariants(entry) {
  const { topRing, sideFace, longAxis } = entry.featurePlanes || {};
  if (!topRing || !sideFace || !longAxis) return [];
  const axis = longAxis.clone().normalize();
  const topNormal = topRing.normal.clone().normalize();
  const sideNormal = sideFace.normal.clone().normalize();
  const variants = [];
  [-1, 1].forEach((zSign) => {
    const z = axis.clone().multiplyScalar(zSign).normalize();
    if (topNormal.dot(z) < 0.75) return;
    [-1, 1].forEach((xSign) => {
      const x = sideNormal.clone().multiplyScalar(xSign).addScaledVector(z, -sideNormal.dot(z) * xSign);
      if (x.lengthSq() < 1e-10) return;
      x.normalize();
      const y = z.clone().cross(x).normalize();
      variants.push({
        frame: new THREE.Matrix4().makeBasis(x, y, z),
        x,
        y,
        z,
      });
    });
  });
  return variants;
}

function featureAlignmentCandidates(libraryEntry, scanbodyEntry, sourcePoints, targetPoints) {
  const sourceFrames = detectedFeatureFrameVariants(libraryEntry);
  const targetFrames = detectedFeatureFrameVariants(scanbodyEntry);
  const sourceCentroid = pointCentroid(sourcePoints);
  const targetCentroid = pointCentroid(targetPoints);
  const sourceTop = libraryEntry.featurePlanes.topRing;
  const sourceSide = libraryEntry.featurePlanes.sideFace;
  const targetTop = scanbodyEntry.featurePlanes.topRing;
  const targetSide = scanbodyEntry.featurePlanes.sideFace;
  const candidates = [];

  sourceFrames.forEach((sourceFrame) => {
    targetFrames.forEach((targetFrame) => {
      const rotationMatrix = targetFrame.frame.clone().multiply(sourceFrame.frame.clone().invert());
      const rotation = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
      const rotatedTopCenter = sourceTop.center.clone().applyQuaternion(rotation);
      const rotatedSideCenter = sourceSide.center.clone().applyQuaternion(rotation);
      const rotatedCentroid = sourceCentroid.clone().applyQuaternion(rotation);
      const translation = targetFrame.z.clone().multiplyScalar(targetTop.center.clone().sub(rotatedTopCenter).dot(targetFrame.z))
        .addScaledVector(targetFrame.x, targetSide.center.clone().sub(rotatedSideCenter).dot(targetFrame.x))
        .addScaledVector(targetFrame.y, targetCentroid.clone().sub(rotatedCentroid).dot(targetFrame.y));
      candidates.push({
        matrix: new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1)),
        targetRingPlane: targetTop,
      });
    });
  });

  return candidates;
}

function prepareFeatureRegistration(libraryEntry, scanbodyEntry) {
  const sourcePoints = sampleGeometryPoints(libraryEntry.mesh.geometry, 750);
  const targetPoints = sampleGeometryPoints(scanbodyEntry.mesh.geometry, 1100);
  const candidates = featureAlignmentCandidates(libraryEntry, scanbodyEntry, sourcePoints, targetPoints);
  if (!candidates.length) {
    throw new Error("Run Feature Detect again; long axis, top ring, and side face are required.");
  }
  let preview = null;
  candidates.forEach((candidate) => {
    const error = scoreInitialRegistration(sourcePoints, targetPoints, candidate.matrix);
    if (!preview || error < preview.error) {
      preview = {
        matrix: candidate.matrix.clone(),
        error,
        targetRingPlane: candidate.targetRingPlane || null,
      };
    }
  });
  return {
    sourcePoints,
    targetPoints,
    candidates: candidates.map((candidate) => candidate.matrix),
    preview,
    initialization: "detected long-axis/top-ring/side-plane features",
  };
}

function refinePreparedRegistration(preparation) {
  let best = null;
  preparation.candidates.forEach((initial) => {
    const candidate = refineRegistration(preparation.sourcePoints, preparation.targetPoints, initial);
    if (!best || candidate.error < best.error) best = candidate;
  });
  return best;
}

function chooseLibraryRefinementPlanes(geometry) {
  const patches = detectPlanarPatches(geometry, 10);
  const localZ = new THREE.Vector3(0, 0, 1);
  const topTolerance = Math.cos(THREE.MathUtils.degToRad(20));
  const sideTolerance = Math.sin(THREE.MathUtils.degToRad(20));
  const topCandidates = patches
    .filter((patch) => Math.abs(patch.normal.dot(localZ)) >= topTolerance)
    .sort((first, second) => second.center.z - first.center.z || second.area - first.area);
  const sideCandidates = patches
    .filter((patch) => Math.abs(patch.normal.dot(localZ)) <= sideTolerance)
    .sort((first, second) => second.area - first.area);
  return { top: topCandidates[0] || null, side: sideCandidates[0] || null };
}

function projectedNormal(normal, axis) {
  const projected = normal.clone().addScaledVector(axis, -normal.dot(axis));
  return projected.lengthSq() > 1e-10 ? projected.normalize() : null;
}

function signedAngleAroundAxis(from, to, axis) {
  return Math.atan2(axis.dot(from.clone().cross(to)), THREE.MathUtils.clamp(from.dot(to), -1, 1));
}

function chooseScanbodyRefinementPlanes(geometry, matrix, libraryPlanes) {
  const patches = detectPlanarPatches(geometry, 12);
  const rotation = new THREE.Matrix3().setFromMatrix4(matrix);
  const worldZ = new THREE.Vector3(0, 0, 1).applyMatrix3(rotation).normalize();
  const topTolerance = Math.cos(THREE.MathUtils.degToRad(20));
  const sideTolerance = Math.sin(THREE.MathUtils.degToRad(20));
  const topCandidates = patches
    .filter((patch) => Math.abs(patch.normal.dot(worldZ)) >= topTolerance)
    .sort((first, second) => second.center.dot(worldZ) - first.center.dot(worldZ) || second.area - first.area);

  const sourceSideWorld = libraryPlanes.side
    ? projectedNormal(libraryPlanes.side.normal.clone().applyMatrix3(rotation).normalize(), worldZ)
    : null;
  const sideCandidates = patches
    .filter((patch) => Math.abs(patch.normal.dot(worldZ)) <= sideTolerance)
    .map((patch) => {
      const projected = projectedNormal(patch.normal, worldZ);
      if (!projected || !sourceSideWorld) return { patch, angle: Infinity };
      const direct = signedAngleAroundAxis(sourceSideWorld, projected, worldZ);
      const reversed = signedAngleAroundAxis(sourceSideWorld, projected.clone().negate(), worldZ);
      return { patch, angle: Math.abs(direct) <= Math.abs(reversed) ? direct : reversed };
    })
    .sort((first, second) => Math.abs(first.angle) - Math.abs(second.angle) || second.patch.area - first.patch.area);

  return {
    worldZ,
    top: topCandidates[0] || null,
    side: Number.isFinite(sideCandidates[0]?.angle) ? sideCandidates[0] : null,
  };
}

function planeRefinementMatrix(libraryGeometry, scanGeometry, icpMatrix) {
  const maximumTranslation = 1;
  const maximumRotation = THREE.MathUtils.degToRad(15);
  const libraryPlanes = chooseLibraryRefinementPlanes(libraryGeometry);
  const scanPlanes = chooseScanbodyRefinementPlanes(scanGeometry, icpMatrix, libraryPlanes);
  let rotationApplied = false;
  let translationApplied = false;
  let rotationRadians = 0;
  let translationMillimeters = 0;

  if (libraryPlanes.side && scanPlanes.side && Math.abs(scanPlanes.side.angle) <= maximumRotation) {
    rotationRadians = scanPlanes.side.angle;
    rotationApplied = true;
  }

  const localRotation = new THREE.Matrix4().makeRotationZ(rotationRadians);
  const rotatedMatrix = icpMatrix.clone().multiply(localRotation);
  if (libraryPlanes.top && scanPlanes.top) {
    const sourceTopCenter = libraryPlanes.top.center.clone().applyMatrix4(rotatedMatrix);
    translationMillimeters = scanPlanes.top.center.clone().sub(sourceTopCenter).dot(scanPlanes.worldZ);
    if (Math.abs(translationMillimeters) <= maximumTranslation) {
      translationApplied = true;
    } else {
      translationMillimeters = 0;
    }
  }

  const localTranslation = new THREE.Matrix4().makeTranslation(0, 0, translationMillimeters);
  return {
    matrix: rotatedMatrix.multiply(localTranslation),
    rotationApplied,
    translationApplied,
    rotationDegrees: THREE.MathUtils.radToDeg(rotationRadians),
    translationMillimeters,
  };
}

function setMeshTransform(mesh, matrix) {
  matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  mesh.updateMatrix();
  mesh.updateMatrixWorld(true);
}

function deviationColor(value) {
  if (value > 1) return new THREE.Color(0xd83bff);
  const stops = [
    [0, new THREE.Color(0x2457ff)],
    [0.25, new THREE.Color(0x22d3ee)],
    [0.5, new THREE.Color(0x42d890)],
    [0.75, new THREE.Color(0xffe044)],
    [1, new THREE.Color(0xff4b38)],
  ];
  for (let index = 1; index < stops.length; index += 1) {
    if (value <= stops[index][0]) {
      const [startAt, startColor] = stops[index - 1];
      const [endAt, endColor] = stops[index];
      return startColor.clone().lerp(endColor, (value - startAt) / (endAt - startAt));
    }
  }
  return stops[stops.length - 1][1].clone();
}

function subdivideGeometryForDeviation(geometry) {
  const position = geometry.getAttribute("position");
  const positions = [];
  const triangleCount = Math.floor(position.count / 3);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(position, triangle * 3);
    const b = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, triangle * 3 + 2);
    const longestEdge = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
    const segments = Math.min(
      DEVIATION_DISPLAY_MAX_SEGMENTS,
      Math.max(1, Math.ceil(longestEdge / DEVIATION_DISPLAY_MAX_EDGE)),
    );
    const grid = [];
    for (let i = 0; i <= segments; i += 1) {
      grid[i] = [];
      for (let j = 0; j <= segments - i; j += 1) {
        const u = i / segments;
        const v = j / segments;
        grid[i][j] = a.clone()
          .multiplyScalar(1 - u - v)
          .addScaledVector(b, u)
          .addScaledVector(c, v);
      }
    }
    const pushTriangle = (first, second, third) => {
      [first, second, third].forEach((point) => positions.push(point.x, point.y, point.z));
    };
    for (let i = 0; i < segments; i += 1) {
      for (let j = 0; j < segments - i; j += 1) {
        pushTriangle(grid[i][j], grid[i + 1][j], grid[i][j + 1]);
        if (j < segments - i - 1) {
          pushTriangle(grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]);
        }
      }
    }
  }
  const displayGeometry = new THREE.BufferGeometry();
  displayGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  displayGeometry.computeVertexNormals();
  return displayGeometry;
}

function prepareDeviationDisplayGeometry(entry) {
  const baseGeometry = entry.deviationBaseGeometry || entry.mesh.geometry;
  const displayGeometry = subdivideGeometryForDeviation(baseGeometry);
  if (entry.deviationBaseGeometry) {
    entry.mesh.geometry.dispose();
  } else {
    entry.deviationBaseGeometry = entry.mesh.geometry;
  }
  entry.mesh.geometry = displayGeometry;
  return displayGeometry;
}

function clearDeviationMap(entry, fallbackColor = TYPE_CONFIG.scan.color) {
  delete entry.deviationDistances;
  if (entry.deviationBaseGeometry) {
    entry.mesh.geometry.dispose();
    entry.mesh.geometry = entry.deviationBaseGeometry;
    delete entry.deviationBaseGeometry;
  } else {
    entry.mesh.geometry.deleteAttribute("color");
  }
  entry.mesh.material.vertexColors = false;
  entry.mesh.material.color.set(fallbackColor);
  entry.mesh.material.needsUpdate = true;
}

function deviationEntriesForActiveModule() {
  const source = activeModule === "accuracy-assessment" ? assessmentModels : models;
  return [...source.values()].filter((entry) => entry.deviationDistances);
}

function setDeviationEntryBaseColor(entry) {
  entry.mesh.geometry.deleteAttribute("color");
  entry.mesh.material.vertexColors = false;
  const color = entry.color instanceof THREE.Color
    ? entry.color
    : new THREE.Color(TYPE_CONFIG[entry.type]?.color || TYPE_CONFIG.scan.color);
  entry.mesh.material.color.copy(color);
  entry.mesh.material.needsUpdate = true;
}

function updateDeviationLegendState() {
  const hasDeviationMap = deviationEntriesForActiveModule().length > 0;
  deviationLegend.hidden = !hasDeviationMap || activeModule === "report";
  deviationLegend.classList.toggle("deviation-map-off", !deviationColorMapVisible);
  deviationScaleRange.disabled = !deviationColorMapVisible;
  deviationScaleNumber.disabled = !deviationColorMapVisible;
  deviationColorMapToggle.checked = deviationColorMapVisible;
}

function applyDeviationColorMapVisibility() {
  const allEntries = [...models.values(), ...assessmentModels.values()].filter((entry) => entry.deviationDistances);
  allEntries.forEach((entry) => {
    if (deviationColorMapVisible) colorizeDeviationEntry(entry, deviationScaleMaximum);
    else setDeviationEntryBaseColor(entry);
  });
  updateDeviationLegendState();
  renderReportModule();
}

function disposeAlignmentMarker(entry) {
  if (!entry.alignmentTopRingMarker) return;
  entry.mesh.remove(entry.alignmentTopRingMarker);
  entry.alignmentTopRingMarker.traverse((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
    else child.material?.dispose();
  });
  entry.alignmentTopRingMarker = null;
}

function clearAlignmentMarker(entry) {
  disposeAlignmentMarker(entry);
}

function disposeEntryGeometry(entry) {
  disposeAlignmentMarker(entry);
  const geometries = new Set([entry.mesh.geometry]);
  if (entry.deviationBaseGeometry) geometries.add(entry.deviationBaseGeometry);
  geometries.forEach((geometry) => geometry.dispose());
  delete entry.deviationBaseGeometry;
}

function colorizeDeviationEntry(scanEntry, maximum = deviationScaleMaximum) {
  if (!scanEntry.deviationDistances) return;
  if (!deviationColorMapVisible) {
    setDeviationEntryBaseColor(scanEntry);
    return;
  }
  const position = scanEntry.mesh.geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  scanEntry.deviationDistances.forEach((distance, index) => {
    const color = deviationColor(distance / maximum);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  });
  scanEntry.mesh.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  scanEntry.mesh.material.vertexColors = true;
  scanEntry.mesh.material.color.set(0xffffff);
  scanEntry.mesh.material.needsUpdate = true;
}

function setDeviationScale(value) {
  const maximum = Math.min(100, Math.max(0.05, Number(value) || 1));
  deviationScaleMaximum = maximum;
  if (maximum > Number(deviationScaleRange.max)) {
    deviationScaleRange.max = String(Math.ceil(maximum));
  }
  deviationScaleRange.value = String(maximum);
  deviationScaleNumber.value = maximum.toFixed(2);
  document.querySelector("#deviation-max").textContent = `${maximum.toFixed(2)} mm+`;
  models.forEach((entry) => {
    if (entry.type === "scan" && entry.deviationDistances) colorizeDeviationEntry(entry, maximum);
  });
  assessmentModels.forEach((entry) => {
    if (entry.type === "assessment-scanbody" && entry.deviationDistances) colorizeDeviationEntry(entry, maximum);
  });
  updateDeviationLegendState();
  renderReportModule();
}

function matrixRows(matrix) {
  const elements = matrix.elements;
  return [
    [elements[0], elements[4], elements[8], elements[12]],
    [elements[1], elements[5], elements[9], elements[13]],
    [elements[2], elements[6], elements[10], elements[14]],
    [elements[3], elements[7], elements[11], elements[15]],
  ];
}

function registrationAngles(matrix) {
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, rotation, scale);
  const euler = new THREE.Euler().setFromQuaternion(rotation, "XYZ");
  return {
    position,
    rotation: {
      x: THREE.MathUtils.radToDeg(euler.x),
      y: THREE.MathUtils.radToDeg(euler.y),
      z: THREE.MathUtils.radToDeg(euler.z),
    },
  };
}

function renderRegistrationMatrices() {
  const registrations = [...models.values()]
    .filter((entry) => entry.type === "registered" && entry.registrationMatrix);

  if (!registrations.length) {
    registrationMatrixList.innerHTML = '<div class="matrix-empty">No registration matrices are available.</div>';
    return;
  }

  const groupedRegistrations = new Map();
  registrations.forEach((entry) => {
    const groupId = entry.groupId || "ungrouped";
    if (!groupedRegistrations.has(groupId)) {
      groupedRegistrations.set(groupId, {
        id: groupId,
        name: scanGroups.get(groupId)?.name || "Ungrouped full-arch scan",
        entries: [],
      });
    }
    groupedRegistrations.get(groupId).entries.push(entry);
  });

  const groups = [...groupedRegistrations.values()]
    .sort((first, second) => first.name.localeCompare(second.name));
  groups.forEach((group) => {
    group.entries.sort((first, second) => (
      (first.registrationTargetName || first.name)
        .localeCompare(second.registrationTargetName || second.name, undefined, { numeric: true })
    ));
  });

  registrationMatrixList.innerHTML = groups.map((group, groupIndex) => {
    const entries = group.entries.map((entry) => {
      const rows = matrixRows(entry.registrationMatrix);
      const summary = registrationAngles(entry.registrationMatrix);
      const rmsError = entry.registrationError ?? entry.initialAlignmentError ?? 0;
      const stageLabel = entry.registrationStage === "initial"
        ? "INITIAL"
        : (entry.registrationStage === "plane-refined" ? "PLANE REFINED" : "ICP");
      const matrixValues = rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
        `<span class="matrix-value ${columnIndex === 3 && rowIndex < 3 ? "translation" : ""}">${value.toFixed(6)}</span>`
      ))).join("");
      return `
        <article class="matrix-entry">
          <div class="matrix-entry-heading">
            <div>
              <strong>${escapeHTML(entry.registrationTargetName || entry.name)}</strong>
              <span>${escapeHTML(entry.registrationSourceName || "Library")} → scanbody coordinates</span>
            </div>
            <span class="matrix-entry-error">${stageLabel} RMS ${Number(rmsError).toFixed(4)} mm</span>
          </div>
          <div class="matrix-grid" aria-label="4 by 4 transformation matrix">${matrixValues}</div>
          <div class="matrix-summary">
            <span>Tx ${summary.position.x.toFixed(4)} mm</span>
            <span>Ty ${summary.position.y.toFixed(4)} mm</span>
            <span>Tz ${summary.position.z.toFixed(4)} mm</span>
            <span>Rx ${summary.rotation.x.toFixed(3)}°</span>
            <span>Ry ${summary.rotation.y.toFixed(3)}°</span>
            <span>Rz ${summary.rotation.z.toFixed(3)}°</span>
          </div>
        </article>`;
    }).join("");
    return `
      <section class="matrix-scan-group" data-matrix-group="${groupIndex}">
        <button class="matrix-scan-header" type="button" aria-expanded="true">
          <span class="matrix-scan-chevron">
            <svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>
          </span>
          <span>
            <strong>${escapeHTML(group.name)}</strong>
            <small>${group.entries.length} REGISTERED SCANBOD${group.entries.length === 1 ? "Y" : "IES"}</small>
          </span>
        </button>
        <div class="matrix-scan-entries">${entries}</div>
      </section>`;
  }).join("");

  registrationMatrixList.querySelectorAll(".matrix-scan-header").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".matrix-scan-group");
      const collapsed = group.classList.toggle("collapsed");
      button.setAttribute("aria-expanded", String(!collapsed));
    });
  });
}

function registrationExportData() {
  const registrations = [...models.values()]
    .filter((entry) => entry.type === "registered" && entry.registrationMatrix);
  const groups = new Map();

  registrations.forEach((entry) => {
    const group = scanGroups.get(entry.groupId);
    const groupId = entry.groupId || "ungrouped";
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        full_arch_scan_name: group?.name || "Ungrouped full-arch scan",
        full_arch_scan_group_id: groupId,
        scanbodies: [],
      });
    }
    const summary = registrationAngles(entry.registrationMatrix);
    const rmsError = entry.registrationError ?? entry.initialAlignmentError ?? 0;
    groups.get(groupId).scanbodies.push({
      scanbody_name: entry.registrationTargetName || entry.name,
      library_name: entry.registrationSourceName || "Library",
      registration_stage: entry.registrationStage || null,
      matrix_4x4_row_major: matrixRows(entry.registrationMatrix),
      icp_matrix_4x4_row_major: entry.icpRegistrationMatrix
        ? matrixRows(entry.icpRegistrationMatrix)
        : matrixRows(entry.registrationMatrix),
      plane_refinement: entry.planeRefinement || null,
      translation_mm: {
        x: summary.position.x,
        y: summary.position.y,
        z: summary.position.z,
      },
      rotation_degrees_xyz: {
        x: summary.rotation.x,
        y: summary.rotation.y,
        z: summary.rotation.z,
      },
      rms_error_mm: Number(rmsError),
    });
  });

  const fullArchScans = [...groups.values()]
    .sort((first, second) => first.full_arch_scan_name.localeCompare(second.full_arch_scan_name));
  fullArchScans.forEach((fullArchScan) => {
    fullArchScan.scanbodies.sort((first, second) => first.scanbody_name.localeCompare(second.scanbody_name, undefined, { numeric: true }));
  });

  return {
    format: "OnXTrue Registration Matrices",
    version: 1,
    exported_at: new Date().toISOString(),
    matrix_definition: "Each 4x4 matrix transforms a point from original Scan Body Library coordinates into the registered scanbody coordinate system.",
    coordinate_convention: {
      handedness: "Three.js right-handed",
      vertical_axis: "Z",
      units: "millimeters",
      vector_convention: "column vectors",
      equation: "registered_point = matrix × library_point",
    },
    full_arch_scans: fullArchScans,
  };
}

async function exportRegistrationMatrices() {
  const data = registrationExportData();
  if (!data.full_arch_scans.length) {
    showToast("No registration matrices are available to export.", "error");
    return;
  }
  const contents = `${JSON.stringify(data, null, 2)}\n`;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const enteredName = registrationExportFilename.value.trim();
  const baseName = enteredName || `OnXTrue_Registration_Matrices_${timestamp}.json`;
  const suggestedName = baseName.toLowerCase().endsWith(".json") ? baseName : `${baseName}.json`;
  registrationExportFilename.value = suggestedName;

  if ("showSaveFilePicker" in window) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: "JSON registration matrix file",
          accept: { "application/json": [".json"] },
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
      showToast(`Saved matrices for ${data.full_arch_scans.length} full-arch scan${data.full_arch_scans.length === 1 ? "" : "s"}.`);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn("Native Save dialog unavailable; using browser download.", error);
    }
  }

  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Downloaded matrices for ${data.full_arch_scans.length} full-arch scan${data.full_arch_scans.length === 1 ? "" : "s"}.`);
}

function openRegistrationMatrices() {
  renderRegistrationMatrices();
  if (!registrationExportFilename.value.trim()) {
    registrationExportFilename.value = "OnXTrue_Registration_Matrices.json";
  }
  registrationMatrixWindow.hidden = false;
  document.body.classList.add("modal-open");
}

function closeRegistrationMatrices() {
  registrationMatrixWindow.hidden = true;
  document.body.classList.remove("modal-open");
}

function formatMicrometers(valueMillimeters) {
  return `${(Number(valueMillimeters || 0) * 1000).toFixed(2)} µm`;
}

function renderAssessmentAlignmentReport() {
  assessmentAlignmentWindowTitle.textContent = "Trueness Distances";
  assessmentAlignmentWindowDescription.textContent =
    "Post-alignment test scanbody origin distance to the matched reference scanbody";
  const testDatasets = [...assessmentDataGroups.values()].filter((dataset) => dataset.type === "test");
  const alignedScans = testDatasets.flatMap((dataset) => (
    assessmentScansForDataset(dataset.id)
      .filter(({ scan }) => scan.assessmentRegistration?.scanbodyDistances?.length)
      .map((item) => ({ ...item, dataset }))
  ));

  if (!alignedScans.length) {
    assessmentAlignmentList.innerHTML = '<div class="matrix-empty">Run Kabsch Align or ICP Align to view trueness distances.</div>';
    return;
  }

  assessmentAlignmentList.innerHTML = alignedScans.map(({ scan, fileRecord, dataset }) => {
    const registration = scan.assessmentRegistration;
    const rows = registration.scanbodyDistances.map((item) => `
      <div class="alignment-report-row">
        <span>${escapeHTML(`SB${item.index}`)}</span>
        <span>${escapeHTML(item.sourceName)}</span>
        <span>${escapeHTML(item.targetName)}</span>
        <strong>${formatMicrometers(item.distance)}</strong>
      </div>
    `).join("");
    return `
      <section class="matrix-scan-group alignment-report-group">
        <div class="alignment-report-header">
          <div>
            <strong>${escapeHTML(scan.name)}</strong>
            <small>${escapeHTML(dataset.name)} · ${escapeHTML(fileRecord.name)} · matched to ${escapeHTML(registration.referenceScanName)}</small>
          </div>
          <span>${registration.refined ? "ICP RMS" : "RMS"} ${formatMicrometers(registration.refined?.rms || registration.rms)}</span>
        </div>
        <div class="alignment-report-table">
          <div class="alignment-report-row heading">
            <span>SB</span>
            <span>Test scanbody</span>
            <span>Reference scanbody</span>
            <span>Distance (µm)</span>
          </div>
          ${rows}
        </div>
      </section>`;
  }).join("");
}

function openAssessmentAlignmentReport() {
  activeAssessmentModalReport = "trueness";
  renderAssessmentAlignmentReport();
  assessmentAlignmentWindow.hidden = false;
  document.body.classList.add("modal-open");
}

function renderAssessmentPrecisionReport() {
  assessmentAlignmentWindowTitle.textContent = "Precision Distances";
  assessmentAlignmentWindowDescription.textContent =
    "Within-group scanbody origin distances after virtual pairwise Kabsch alignment";
  const groups = collectPrecisionReportData();
  if (!groups.length) {
    assessmentAlignmentList.innerHTML = '<div class="matrix-empty">Run Precision Measure to view within-group pairwise distances.</div>';
    return;
  }

  assessmentAlignmentList.innerHTML = groups.map((group) => {
    const pairsHtml = group.pairs.map((pair) => {
      const rows = pair.scanbodyDistances.map((item) => `
        <div class="alignment-report-row">
          <span>${escapeHTML(`SB${item.index}`)}</span>
          <span>${escapeHTML(item.sourceName)}</span>
          <span>${escapeHTML(item.targetName)}</span>
          <strong>${formatMicrometers(item.distance)}</strong>
        </div>
      `).join("");
      return `
        <section class="matrix-scan-group alignment-report-group">
          <div class="alignment-report-header">
            <div>
              <strong>${escapeHTML(pair.name)}</strong>
              <small>${escapeHTML(group.name)} · ${escapeHTML(pair.sourceFileName)} → ${escapeHTML(pair.targetFileName)}</small>
            </div>
            <span>RMS ${formatMicrometers(pair.stats.rms)}</span>
          </div>
          <div class="alignment-report-table">
            <div class="alignment-report-row heading">
              <span>SB</span>
              <span>Scan A</span>
              <span>Scan B</span>
              <span>Distance (µm)</span>
            </div>
            ${rows}
          </div>
        </section>`;
    }).join("");
    return pairsHtml;
  }).join("");
}

function openAssessmentPrecisionReport() {
  activeAssessmentModalReport = "precision";
  renderAssessmentPrecisionReport();
  assessmentAlignmentWindow.hidden = false;
  document.body.classList.add("modal-open");
}

function closeAssessmentAlignmentReport() {
  assessmentAlignmentWindow.hidden = true;
  document.body.classList.remove("modal-open");
}

function setAssessmentWorkflow(workflow) {
  activeAssessmentWorkflow = workflow === "precision" ? "precision" : "trueness";
  assessmentWorkflowToggle.querySelectorAll("[data-assessment-workflow]").forEach((button) => {
    button.classList.toggle("active", button.dataset.assessmentWorkflow === activeAssessmentWorkflow);
  });
  truenessAssessmentActions.hidden = activeAssessmentWorkflow !== "trueness";
  precisionAssessmentActions.hidden = activeAssessmentWorkflow !== "precision";
  updateAssessmentUI();
}

function setReportMode(mode) {
  activeReportMode = mode === "precision" ? "precision" : "trueness";
  renderReportModule();
}

function percentile(sorted, value) {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * value;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function deviationStats(distances) {
  if (!distances.length) return null;
  const sorted = distances.slice().sort((first, second) => first - second);
  const count = sorted.length;
  const sum = sorted.reduce((total, value) => total + value, 0);
  const mean = sum / count;
  const squaredSum = sorted.reduce((total, value) => total + value * value, 0);
  const variance = sorted.reduce((total, value) => total + (value - mean) ** 2, 0) / count;
  return {
    count,
    min: sorted[0],
    q1: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    q3: percentile(sorted, 0.75),
    max: sorted[count - 1],
    mean,
    sd: Math.sqrt(variance),
    rms: Math.sqrt(squaredSum / count),
  };
}

function collectTruenessReportData() {
  return [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .map((dataset) => {
      const scans = assessmentScansForDataset(dataset.id)
        .map(({ scan, fileRecord }) => {
          const distances = (scan.assessmentRegistration?.scanbodyDistances || [])
            .map((item) => Number(item.distance))
            .filter(Number.isFinite);
          return {
            id: `${fileRecord.id}-${scan.id}`,
            name: scan.name,
            sourceFileName: fileRecord.name,
            registration: scan.assessmentRegistration || null,
            distances,
            stats: deviationStats(distances),
          };
        })
        .filter((scan) => scan.stats);
      const distances = scans.flatMap((scan) => scan.distances);
      return {
        id: dataset.id,
        name: dataset.name,
        color: dataset.color,
        scans,
        stats: deviationStats(distances),
      };
    })
    .filter((dataset) => dataset.stats);
}

function collectAssessmentReportData() {
  return collectTruenessReportData();
}

function reportBoxPlotSvg(stats, scaleMax) {
  const width = 420;
  const height = 72;
  const axisStart = 32;
  const axisEnd = 392;
  const y = 36;
  const x = (value) => axisStart + (Math.max(0, Math.min(value, scaleMax)) / Math.max(scaleMax, 0.0001)) * (axisEnd - axisStart);
  const minX = x(stats.min);
  const q1X = x(stats.q1);
  const medianX = x(stats.median);
  const q3X = x(stats.q3);
  const maxX = x(stats.max);
  const meanX = x(stats.mean);
  return `
    <svg class="report-boxplot" viewBox="0 0 ${width} ${height}" role="img" aria-label="Deviation box plot">
      <line x1="${axisStart}" y1="${y}" x2="${axisEnd}" y2="${y}" />
      <line x1="${minX}" y1="${y - 11}" x2="${minX}" y2="${y + 11}" />
      <line x1="${maxX}" y1="${y - 11}" x2="${maxX}" y2="${y + 11}" />
      <rect x="${q1X}" y="${y - 14}" width="${Math.max(1, q3X - q1X)}" height="28" rx="2" />
      <line class="median" x1="${medianX}" y1="${y - 17}" x2="${medianX}" y2="${y + 17}" />
      <circle class="mean" cx="${meanX}" cy="${y}" r="4" />
      <text x="${axisStart}" y="66">0</text>
      <text x="${axisEnd}" y="66" text-anchor="end">${formatMicrometers(scaleMax)}</text>
    </svg>`;
}

function reportGroupComparisonAnalysis(groups, scaleMax, options = {}) {
  const itemKey = options.itemKey || "scans";
  const itemLabel = options.itemLabel || "Scans";
  const itemText = options.itemText || "aligned scans";
  const distanceNote = options.distanceNote
    || "Lower origin-distance values indicate closer agreement to matched reference scanbody origins.";
  const sortedByMean = groups.slice().sort((first, second) => first.stats.mean - second.stats.mean);
  const sortedByRms = groups.slice().sort((first, second) => first.stats.rms - second.stats.rms);
  const sortedByIqr = groups.slice().sort((first, second) => (
    (first.stats.q3 - first.stats.q1) - (second.stats.q3 - second.stats.q1)
  ));
  const bestMean = sortedByMean[0];
  const highestMean = sortedByMean[sortedByMean.length - 1];
  const bestRms = sortedByRms[0];
  const tightest = sortedByIqr[0];
  const comparisonCards = groups.length > 1 ? [
    ["Lowest mean", `${bestMean.name} · ${formatMicrometers(bestMean.stats.mean)}`],
    ["Highest mean", `${highestMean.name} · ${formatMicrometers(highestMean.stats.mean)}`],
    ["Mean gap", formatMicrometers(highestMean.stats.mean - bestMean.stats.mean)],
    ["Lowest RMS", `${bestRms.name} · ${formatMicrometers(bestRms.stats.rms)}`],
    ["Tightest IQR", `${tightest.name} · ${formatMicrometers(tightest.stats.q3 - tightest.stats.q1)}`],
  ] : [
    ["Group", bestMean.name],
    ["Mean", formatMicrometers(bestMean.stats.mean)],
    ["RMS", formatMicrometers(bestMean.stats.rms)],
    ["IQR", formatMicrometers(bestMean.stats.q3 - bestMean.stats.q1)],
    ["Max", formatMicrometers(bestMean.stats.max)],
  ];
  const rows = groups.map((group) => `
    <tr>
      <td><span class="report-group-dot" style="background:${group.color};box-shadow:0 0 10px ${group.color}66"></span>${escapeHTML(group.name)}</td>
      <td>${group[itemKey].length.toLocaleString()}</td>
      <td>${group.stats.count.toLocaleString()}</td>
      <td>${formatMicrometers(group.stats.mean)}</td>
      <td>${formatMicrometers(group.stats.median)}</td>
      <td>${formatMicrometers(group.stats.sd)}</td>
      <td>${formatMicrometers(group.stats.rms)}</td>
      <td>${formatMicrometers(group.stats.q3 - group.stats.q1)}</td>
      <td>${formatMicrometers(group.stats.max)}</td>
    </tr>
  `).join("");
  const plots = groups.map((group) => `
    <article class="report-plot report-comparison-plot">
      <div>
        <strong>${escapeHTML(group.name)}</strong>
        <span>${group[itemKey].length.toLocaleString()} ${escapeHTML(itemText)} · ${group.stats.count.toLocaleString()} scanbody distances</span>
      </div>
      ${reportBoxPlotSvg(group.stats, scaleMax)}
    </article>
  `).join("");

  return `
    <section class="report-analysis">
      <header class="report-analysis-header">
        <div>
          <span>GROUP COMPARISON</span>
          <h3>Test Group Statistics</h3>
        </div>
        <p>${escapeHTML(distanceNote)}</p>
      </header>
      <div class="report-analysis-cards">
        ${comparisonCards.map(([label, value]) => `
          <div class="report-analysis-card">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value))}</strong>
          </div>
        `).join("")}
      </div>
      <div class="report-table-wrap report-comparison-table-wrap">
        <table class="report-table report-comparison-table">
          <thead>
            <tr>
              <th>Test group</th>
              <th>${escapeHTML(itemLabel)}</th>
              <th>Distances</th>
              <th>Mean</th>
              <th>Median</th>
              <th>SD</th>
              <th>RMS</th>
              <th>IQR</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="report-plots report-comparison-plots">${plots}</div>
    </section>
  `;
}

function renderReportModeToggle() {
  reportModeToggle.querySelectorAll("[data-report-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.reportMode === activeReportMode);
  });
}

function renderTruenessReportModule() {
  reportPanelKicker.textContent = "TRUENESS REPORT";
  reportPanelTitle.textContent = "Trueness Deviation Statistics";
  reportPanelDescription.textContent =
    "Scanbody origin distances from each aligned test scan to its matched reference scan, grouped by test group.";
  const groups = collectTruenessReportData();
  if (!groups.length) {
    reportSummaryCards.innerHTML = "";
    reportContent.innerHTML = '<div class="report-empty">Run Kabsch Align or ICP Align to generate trueness statistics.</div>';
    reportSidebarSummary.textContent = "No trueness report data yet.";
    return;
  }

  const allDistances = groups.flatMap((group) => group.scans.flatMap((scan) => scan.distances));
  const overall = deviationStats(allDistances);
  const scaleMax = Math.max(...groups.flatMap((group) => [
    group.stats.max,
    ...group.scans.map((scan) => scan.stats.max),
  ]), 0.001);
  const totalScans = groups.reduce((sum, group) => sum + group.scans.length, 0);
  reportSidebarSummary.textContent =
    `${groups.length} test group${groups.length === 1 ? "" : "s"} · ${totalScans} aligned scan${totalScans === 1 ? "" : "s"} · overall mean ${formatMicrometers(overall.mean)}`;

  reportSummaryCards.innerHTML = [
    ["Test groups", groups.length],
    ["Aligned scans", totalScans],
    ["Overall mean", formatMicrometers(overall.mean)],
    ["Overall RMS", formatMicrometers(overall.rms)],
  ].map(([label, value]) => `
    <div class="report-summary-card">
      <span>${escapeHTML(String(label))}</span>
      <strong>${escapeHTML(String(value))}</strong>
    </div>
  `).join("");

  const analysisHtml = reportGroupComparisonAnalysis(groups, scaleMax);
  const groupHtml = groups.map((group) => {
    const rows = group.scans.map((scan) => `
      <tr>
        <td>${escapeHTML(scan.name)}</td>
        <td>${escapeHTML(scan.sourceFileName || "JSON")}</td>
        <td>${scan.stats.count.toLocaleString()}</td>
        <td>${formatMicrometers(scan.stats.mean)}</td>
        <td>${formatMicrometers(scan.stats.median)}</td>
        <td>${formatMicrometers(scan.stats.sd)}</td>
        <td>${formatMicrometers(scan.stats.rms)}</td>
        <td>${formatMicrometers(scan.stats.q1)} / ${formatMicrometers(scan.stats.q3)}</td>
        <td>${formatMicrometers(scan.stats.max)}</td>
      </tr>
    `).join("");
    const plots = group.scans.map((scan) => `
      <article class="report-plot">
        <div>
          <strong>${escapeHTML(scan.name)}</strong>
          <span>${escapeHTML(scan.registration?.referenceScanName || "Reference scan")}</span>
        </div>
        ${reportBoxPlotSvg(scan.stats, scaleMax)}
      </article>
    `).join("");
    const combinedPlot = `
      <article class="report-plot report-plot-combined">
        <div>
          <strong>${escapeHTML(group.name)} combined</strong>
          <span>${group.stats.count.toLocaleString()} scanbody distances from all aligned scans</span>
        </div>
        ${reportBoxPlotSvg(group.stats, scaleMax)}
      </article>
    `;
    return `
      <section class="report-group">
        <header class="report-group-header">
          <div>
            <span style="color:${group.color}">TEST GROUP</span>
            <h3>${escapeHTML(group.name)}</h3>
          </div>
          <div class="report-group-stats">
            <span>Mean ${formatMicrometers(group.stats.mean)}</span>
            <span>Median ${formatMicrometers(group.stats.median)}</span>
            <span>RMS ${formatMicrometers(group.stats.rms)}</span>
            <span>Max ${formatMicrometers(group.stats.max)}</span>
          </div>
        </header>
        <div class="report-table-wrap">
          <table class="report-table">
            <thead>
              <tr>
                <th>Scan</th>
                <th>File</th>
                <th>Scanbodies</th>
                <th>Mean</th>
                <th>Median</th>
                <th>SD</th>
                <th>RMS</th>
                <th>Q1 / Q3</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="report-plots">${combinedPlot}${plots}</div>
      </section>`;
  }).join("");
  reportContent.innerHTML = analysisHtml + groupHtml;
}

function collectPrecisionReportData() {
  return [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test" && dataset.precisionAssessment?.pairs?.length)
    .map((dataset) => {
      const pairs = dataset.precisionAssessment.pairs
        .map((pair) => ({
          ...pair,
          distances: pair.scanbodyDistances.map((item) => item.distance).filter(Number.isFinite),
          stats: pair.stats,
        }))
        .filter((pair) => pair.stats);
      const distances = pairs.flatMap((pair) => pair.distances);
      return {
        id: dataset.id,
        name: dataset.name,
        color: dataset.color,
        pairs,
        stats: deviationStats(distances),
      };
    })
    .filter((dataset) => dataset.stats);
}

function renderPrecisionReportModule() {
  reportPanelKicker.textContent = "PRECISION REPORT";
  reportPanelTitle.textContent = "Precision Deviation Statistics";
  reportPanelDescription.textContent =
    "Within-group scanbody origin distances from virtual pairwise Kabsch alignment, grouped by test group.";
  const groups = collectPrecisionReportData();
  if (!groups.length) {
    reportSummaryCards.innerHTML = "";
    reportContent.innerHTML = '<div class="report-empty">Run Precision Measure to generate precision statistics.</div>';
    reportSidebarSummary.textContent = "No precision report data yet.";
    return;
  }

  const allDistances = groups.flatMap((group) => group.pairs.flatMap((pair) => pair.distances));
  const overall = deviationStats(allDistances);
  const scaleMax = Math.max(...groups.flatMap((group) => [
    group.stats.max,
    ...group.pairs.map((pair) => pair.stats.max),
  ]), 0.001);
  const totalPairs = groups.reduce((sum, group) => sum + group.pairs.length, 0);
  reportSidebarSummary.textContent =
    `${groups.length} test group${groups.length === 1 ? "" : "s"} · ${totalPairs} scan pair${totalPairs === 1 ? "" : "s"} · precision mean ${formatMicrometers(overall.mean)}`;

  reportSummaryCards.innerHTML = [
    ["Test groups", groups.length],
    ["Scan pairs", totalPairs],
    ["SB distances", overall.count],
    ["Overall RMS", formatMicrometers(overall.rms)],
  ].map(([label, value]) => `
    <div class="report-summary-card">
      <span>${escapeHTML(String(label))}</span>
      <strong>${escapeHTML(String(value))}</strong>
    </div>
  `).join("");

  const analysisHtml = reportGroupComparisonAnalysis(groups, scaleMax, {
    itemKey: "pairs",
    itemLabel: "Pairs",
    itemText: "scan pairs",
    distanceNote: "Lower origin-distance values indicate tighter repeatability between scans inside the same test group.",
  });
  const groupHtml = groups.map((group) => {
    const rows = group.pairs.map((pair) => `
      <tr>
        <td>${escapeHTML(pair.sourceScanName)}</td>
        <td>${escapeHTML(pair.targetScanName)}</td>
        <td>${pair.stats.count.toLocaleString()}</td>
        <td>${formatMicrometers(pair.stats.mean)}</td>
        <td>${formatMicrometers(pair.stats.median)}</td>
        <td>${formatMicrometers(pair.stats.sd)}</td>
        <td>${formatMicrometers(pair.stats.rms)}</td>
        <td>${formatMicrometers(pair.stats.q1)} / ${formatMicrometers(pair.stats.q3)}</td>
        <td>${formatMicrometers(pair.stats.max)}</td>
      </tr>
    `).join("");
    const plots = group.pairs.map((pair) => `
      <article class="report-plot">
        <div>
          <strong>${escapeHTML(pair.name)}</strong>
          <span>${escapeHTML(pair.sourceFileName)} → ${escapeHTML(pair.targetFileName)}</span>
        </div>
        ${reportBoxPlotSvg(pair.stats, scaleMax)}
      </article>
    `).join("");
    const combinedPlot = `
      <article class="report-plot report-plot-combined">
        <div>
          <strong>${escapeHTML(group.name)} combined</strong>
          <span>${group.stats.count.toLocaleString()} scanbody distances from all scan pairs</span>
        </div>
        ${reportBoxPlotSvg(group.stats, scaleMax)}
      </article>
    `;
    return `
      <section class="report-group">
        <header class="report-group-header">
          <div>
            <span style="color:${group.color}">TEST GROUP</span>
            <h3>${escapeHTML(group.name)}</h3>
          </div>
          <div class="report-group-stats">
            <span>Mean ${formatMicrometers(group.stats.mean)}</span>
            <span>Median ${formatMicrometers(group.stats.median)}</span>
            <span>RMS ${formatMicrometers(group.stats.rms)}</span>
            <span>Max ${formatMicrometers(group.stats.max)}</span>
          </div>
        </header>
        <div class="report-table-wrap">
          <table class="report-table">
            <thead>
              <tr>
                <th>Scan A</th>
                <th>Scan B</th>
                <th>Scanbodies</th>
                <th>Mean</th>
                <th>Median</th>
                <th>SD</th>
                <th>RMS</th>
                <th>Q1 / Q3</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="report-plots">${combinedPlot}${plots}</div>
      </section>`;
  }).join("");
  reportContent.innerHTML = analysisHtml + groupHtml;
}

function renderReportModule() {
  renderReportModeToggle();
  if (activeReportMode === "precision") {
    renderPrecisionReportModule();
  } else {
    renderTruenessReportModule();
  }
}

function applyDeviationMap(scanEntry, libraryGeometry, registrationMatrix) {
  const registeredPoints = sampleGeometryPoints(libraryGeometry, 5000)
    .map((point) => point.applyMatrix4(registrationMatrix));
  const tree = buildKdTree(registeredPoints);
  const displayGeometry = prepareDeviationDisplayGeometry(scanEntry);
  const position = displayGeometry.getAttribute("position");
  const distances = [];
  for (let index = 0; index < position.count; index += 1) {
    const point = new THREE.Vector3(position.getX(index), position.getY(index), position.getZ(index));
    distances.push(Math.sqrt(nearestPoint(tree, registeredPoints, point).distanceSquared));
  }
  scanEntry.deviationDistances = new Float32Array(distances);
  colorizeDeviationEntry(scanEntry, deviationScaleMaximum);
}

function isolatedName(originalName, index) {
  const extensionIndex = originalName.toLowerCase().lastIndexOf(".stl");
  const baseName = extensionIndex === -1 ? originalName : originalName.slice(0, extensionIndex);
  return `${baseName} SB${index}.stl`;
}

function sequencedScanbodyName(fullArchName, index) {
  const extensionIndex = fullArchName.toLowerCase().lastIndexOf(".stl");
  const baseName = extensionIndex === -1 ? fullArchName : fullArchName.slice(0, extensionIndex);
  return `${baseName}_SB${index}.stl`;
}

function setEntryName(entry, name) {
  entry.name = name;
  const modelName = entry.row?.querySelector(".model-name");
  if (modelName) {
    modelName.textContent = name;
    modelName.title = name;
  }
  const objectName = entry.objectRow?.querySelector(".object-name");
  if (objectName) {
    objectName.textContent = name;
    objectName.title = name;
  }
  const visibilityLabel = entry.objectRow?.querySelector(".visibility-switch");
  if (visibilityLabel) visibilityLabel.title = `Show or hide ${name}`;
  const visibilityInput = entry.objectRow?.querySelector("input");
  if (visibilityInput) visibilityInput.setAttribute("aria-label", `Show ${name}`);
}

function symmetricEigenvectors3(input) {
  const matrix = input.map((row) => row.slice());
  const eigenvectors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  for (let iteration = 0; iteration < 50; iteration += 1) {
    let pivotRow = 0;
    let pivotColumn = 1;
    let maximum = 0;
    for (let row = 0; row < 3; row += 1) {
      for (let column = row + 1; column < 3; column += 1) {
        const value = Math.abs(matrix[row][column]);
        if (value > maximum) {
          maximum = value;
          pivotRow = row;
          pivotColumn = column;
        }
      }
    }
    if (maximum < 1e-12) break;

    const app = matrix[pivotRow][pivotRow];
    const aqq = matrix[pivotColumn][pivotColumn];
    const apq = matrix[pivotRow][pivotColumn];
    const angle = 0.5 * Math.atan2(2 * apq, aqq - app);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    for (let index = 0; index < 3; index += 1) {
      if (index === pivotRow || index === pivotColumn) continue;
      const rowValue = matrix[index][pivotRow];
      const columnValue = matrix[index][pivotColumn];
      matrix[index][pivotRow] = rowValue * cosine - columnValue * sine;
      matrix[pivotRow][index] = matrix[index][pivotRow];
      matrix[index][pivotColumn] = rowValue * sine + columnValue * cosine;
      matrix[pivotColumn][index] = matrix[index][pivotColumn];
    }

    matrix[pivotRow][pivotRow] = app * cosine * cosine - 2 * apq * cosine * sine + aqq * sine * sine;
    matrix[pivotColumn][pivotColumn] = app * sine * sine + 2 * apq * cosine * sine + aqq * cosine * cosine;
    matrix[pivotRow][pivotColumn] = 0;
    matrix[pivotColumn][pivotRow] = 0;

    for (let index = 0; index < 3; index += 1) {
      const rowValue = eigenvectors[index][pivotRow];
      const columnValue = eigenvectors[index][pivotColumn];
      eigenvectors[index][pivotRow] = rowValue * cosine - columnValue * sine;
      eigenvectors[index][pivotColumn] = rowValue * sine + columnValue * cosine;
    }
  }

  return [0, 1, 2]
    .map((index) => ({
      value: matrix[index][index],
      vector: new THREE.Vector3(
        eigenvectors[0][index],
        eigenvectors[1][index],
        eigenvectors[2][index],
      ).normalize(),
    }))
    .sort((first, second) => second.value - first.value);
}

function archProjection(records) {
  const center = pointCentroid(records.map((record) => record.center));
  const covariance = Array.from({ length: 3 }, () => [0, 0, 0]);
  records.forEach((record) => {
    const point = record.center.clone().sub(center);
    covariance[0][0] += point.x * point.x;
    covariance[0][1] += point.x * point.y;
    covariance[0][2] += point.x * point.z;
    covariance[1][0] += point.y * point.x;
    covariance[1][1] += point.y * point.y;
    covariance[1][2] += point.y * point.z;
    covariance[2][0] += point.z * point.x;
    covariance[2][1] += point.z * point.y;
    covariance[2][2] += point.z * point.z;
  });
  const axes = symmetricEigenvectors3(covariance);
  const xAxis = axes[0]?.vector || new THREE.Vector3(1, 0, 0);
  const yAxis = axes[1]?.vector || new THREE.Vector3(0, 1, 0);
  return records.map((record, index) => {
    const point = record.center.clone().sub(center);
    return {
      index,
      x: point.dot(xAxis),
      y: point.dot(yAxis),
    };
  });
}

function projectedDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function archPathScore(path, projected) {
  let length = 0;
  const segments = [];
  for (let index = 1; index < path.length; index += 1) {
    const previous = projected[path[index - 1]];
    const current = projected[path[index]];
    const segmentLength = projectedDistance(previous, current);
    length += segmentLength;
    segments.push({
      x: current.x - previous.x,
      y: current.y - previous.y,
      length: segmentLength,
    });
  }
  let turnAngle = 0;
  for (let index = 1; index < segments.length; index += 1) {
    const first = segments[index - 1];
    const second = segments[index];
    if (first.length < 1e-8 || second.length < 1e-8) continue;
    const dot = THREE.MathUtils.clamp(
      (first.x * second.x + first.y * second.y) / (first.length * second.length),
      -1,
      1,
    );
    turnAngle += Math.acos(dot);
  }
  const averageSegment = segments.length ? length / segments.length : 0;
  return length + turnAngle * averageSegment * 0.75;
}

function smoothestArchPath(records) {
  if (records.length <= 2) return records.map((_, index) => index);
  const projected = archProjection(records);
  if (records.length > 8) {
    const remaining = new Set(records.map((_, index) => index));
    const path = [0];
    remaining.delete(0);
    while (remaining.size) {
      const last = projected[path[path.length - 1]];
      const next = [...remaining]
        .sort((first, second) => projectedDistance(last, projected[first]) - projectedDistance(last, projected[second]))[0];
      path.push(next);
      remaining.delete(next);
    }
    return path;
  }

  let bestPath = null;
  let bestScore = Infinity;
  function visit(path, remaining) {
    if (!remaining.length) {
      const score = archPathScore(path, projected);
      if (score < bestScore) {
        bestScore = score;
        bestPath = path.slice();
      }
      return;
    }
    remaining.forEach((value, index) => {
      path.push(value);
      visit(path, remaining.filter((_, remainingIndex) => remainingIndex !== index));
      path.pop();
    });
  }

  visit([], records.map((_, index) => index));
  return bestPath || records.map((_, index) => index);
}

function orderedArchRecords(records) {
  if (records.length <= 1) return records;
  const path = smoothestArchPath(records);
  if (path.length < 3) return path.map((index) => records[index]);

  const first = records[path[0]];
  const last = records[path[path.length - 1]];
  const closestToFirst = path.slice(1)
    .map((index) => records[index])
    .sort((left, right) => (
      left.center.distanceToSquared(first.center) - right.center.distanceToSquared(first.center)
    ))[0];

  const virtualX = last.center.clone().sub(first.center);
  const toClosest = closestToFirst.center.clone().sub(first.center);
  const virtualZ = virtualX.clone().cross(toClosest);
  if (virtualX.lengthSq() < 1e-8 || virtualZ.lengthSq() < 1e-8) {
    return path.map((index) => records[index]);
  }
  virtualZ.normalize();
  const dot = closestToFirst.localZ.dot(virtualZ);
  const orderedPath = dot >= 0 ? path : path.slice().reverse();
  return orderedPath.map((index) => records[index]);
}

function renameScanbodySequenceForGroup(library, groupId) {
  const group = scanGroups.get(groupId);
  if (!group) return { renamed: 0, ambiguous: false };
  library.mesh.geometry.computeBoundingBox();
  const libraryCenter = library.mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
  const registeredCopies = [...models.values()]
    .filter((entry) => (
      entry.type === "registered"
      && entry.groupId === groupId
      && entry.registrationMatrix
      && entry.registrationFor
    ));
  const records = registeredCopies.map((registeredCopy) => {
    const scanbody = models.get(registeredCopy.registrationFor);
    if (!scanbody) return null;
    const rotation = new THREE.Quaternion();
    registeredCopy.registrationMatrix.decompose(new THREE.Vector3(), rotation, new THREE.Vector3());
    return {
      registeredCopy,
      scanbody,
      center: libraryCenter.clone().applyMatrix4(registeredCopy.registrationMatrix),
      localZ: new THREE.Vector3(0, 0, 1).applyQuaternion(rotation).normalize(),
    };
  }).filter(Boolean);

  if (!records.length) return { renamed: 0, ambiguous: false };
  const orderedRecords = orderedArchRecords(records);
  orderedRecords.forEach((record, index) => {
    const name = sequencedScanbodyName(group.name, index + 1);
    setEntryName(record.scanbody, name);
    record.registeredCopy.registrationTargetName = name;
    const libraryName = (record.registeredCopy.registrationSourceName || library.name).replace(/\.stl$/i, "");
    const targetName = name.replace(/\.stl$/i, "");
    setEntryName(record.registeredCopy, `${libraryName} → ${targetName}`);
  });
  return { renamed: orderedRecords.length, ambiguous: records.length < 3 };
}

function renameRegisteredScanbodySequences(library, groupIds) {
  let renamed = 0;
  let ambiguous = 0;
  [...new Set(groupIds)].forEach((groupId) => {
    const result = renameScanbodySequenceForGroup(library, groupId);
    renamed += result.renamed;
    if (result.ambiguous) ambiguous += 1;
  });
  if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();
  return { renamed, ambiguous };
}

async function isolateScanbodies() {
  const sourceScans = [...models.values()].filter((entry) => entry.type === "scan" && !entry.isolated);
  if (!sourceScans.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Isolating scanbodies…";
  await new Promise((resolve) => setTimeout(resolve, 20));

  try {
    let isolatedTotal = 0;
    let removedSmallTotal = 0;
    sourceScans.forEach((source) => {
      const connectedComponents = isolateGeometry(source.mesh.geometry);
      const mergedComponents = groupNearbyComponents(connectedComponents, 2);
      const { kept: components, removed: removedSmall } = filterSmallComponents(mergedComponents, 3);
      removedSmallTotal += removedSmall;
      const groupId = `group-${source.id}`;
      const sourceVisible = source.mesh.visible;
      const sourceName = source.name;
      removeModel(source.id, false, false);
      createScanGroup({ id: groupId, name: sourceName });
      components.forEach((geometry, index) => {
        const child = addModelFromGeometry({
          geometry,
          id: `${source.id}-sb-${index + 1}`,
          name: isolatedName(source.name, index + 1),
          bytes: 84 + (geometry.getAttribute("position").count / 3) * 50,
          type: "scan",
          isolated: true,
          groupId,
        });
        if (!sourceVisible) setModelVisibility(child, false);
      });
      updateGroupState(groupId);
      isolatedTotal += components.length;
    });
    updateSceneReference();
    invalidateFeatureDetection();
    updateUI();
    fitView();
    const removedNote = removedSmallTotal
      ? ` Removed ${removedSmallTotal} object${removedSmallTotal === 1 ? "" : "s"} under 3 mm.`
      : "";
    showToast(`Created ${isolatedTotal} isolated scanbody object${isolatedTotal === 1 ? "" : "s"}.${removedNote}`);
  } catch (error) {
    console.error("Could not isolate scanbodies:", error);
    showToast(`Scanbody isolation failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function detectFeatures() {
  const library = dataLibraryEntry();
  const scanbodies = [...models.values()].filter((entry) => entry.type === "scan" && entry.isolated);
  if (!library || !scanbodies.length) return;
  const strategy = scanbodyLibraryStrategy(library.libraryType);

  loading.hidden = false;
  loading.querySelector("p").textContent = `Detecting ${strategy.label} features…`;
  await new Promise((resolve) => setTimeout(resolve, 20));

  try {
    const targets = [library, ...scanbodies];
    let planeCount = 0;
    for (let index = 0; index < targets.length; index += 1) {
      const entry = targets[index];
      loading.querySelector("p").textContent = `Feature detect ${index + 1} of ${targets.length}…`;
      await new Promise((resolve) => setTimeout(resolve, 5));
      planeCount += strategy.detectFeatures(entry);
    }
    updateUI();
    showToast(`${strategy.label} features detected on ${targets.length} object${targets.length === 1 ? "" : "s"} (${formatNumber(planeCount)} planes).`);
  } catch (error) {
    console.error("Feature detection failed:", error);
    showToast(`Feature detection failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function cropScanbodies() {
  const library = dataLibraryEntry();
  const scanbodies = [...models.values()].filter((entry) => (
    entry.type === "scan"
    && entry.isolated
    && !entry.registered
    && entry.featurePlanes?.topRing
  ));
  if (!library?.featurePlanes?.topRing || !scanbodies.length) return;
  const strategy = scanbodyLibraryStrategy(library.libraryType);
  const cropTargets = [library, ...scanbodies];

  loading.hidden = false;
  loading.querySelector("p").textContent = `Cropping ${strategy.label} library and scanbodies…`;
  await new Promise((resolve) => setTimeout(resolve, 20));

  let croppedTotal = 0;
  let croppedLibrary = false;
  let croppedScanbodies = 0;
  try {
    for (let index = 0; index < cropTargets.length; index += 1) {
      const entry = cropTargets[index];
      const label = entry.type === "library" ? "library" : `scanbody ${index} of ${scanbodies.length}`;
      loading.querySelector("p").textContent = `Crop ${label}…`;
      await new Promise((resolve) => setTimeout(resolve, 5));
      const croppedGeometry = strategy.cropScanbody(entry);
      if (!croppedGeometry) continue;
      replaceEntryGeometry(entry, croppedGeometry);
      croppedTotal += 1;
      if (entry.type === "library") croppedLibrary = true;
      else croppedScanbodies += 1;
    }

    if (!croppedTotal) {
      updateUI();
      showToast(`No ${strategy.label} library or scanbody geometry was farther than 4.6 mm from the detected top ring.`);
      return;
    }

    updateSceneReference();
    updateUI();
    fitView();
    const croppedParts = [
      croppedLibrary ? "library" : null,
      croppedScanbodies ? `${croppedScanbodies} scanbody object${croppedScanbodies === 1 ? "" : "s"}` : null,
    ].filter(Boolean).join(" and ");
    showToast(`Cropped ${croppedParts} to 4.6 mm from the top ring. Running Feature Detect again…`);
  } catch (error) {
    console.error("Could not crop scanbodies:", error);
    showToast(`Crop SBs failed: ${error.message}`, "error");
    return;
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }

  await detectFeatures();
}

async function registerIsolatedScanbodies() {
  const library = dataLibraryEntry();
  const scanbodies = [...models.values()].filter((entry) => entry.type === "scan" && entry.isolated && !entry.registered);
  if (!library || !scanbodies.length) return;
  const strategy = scanbodyLibraryStrategy(library.libraryType);
  if (![library, ...scanbodies].every((entry) => hasRequiredAlignmentFeatures(entry))) {
    showToast("Run Feature Detect again; long axis, top ring, and side face are required.", "error");
    updateUI();
    return;
  }

  loading.hidden = false;
  loading.querySelector("p").textContent = `Preparing ${strategy.label} initial alignments…`;
  await new Promise((resolve) => setTimeout(resolve, 30));

  try {
    const alignedGroupIds = new Set();
    for (let index = 0; index < scanbodies.length; index += 1) {
      const scanbody = scanbodies[index];
      loading.querySelector("p").textContent = `Initial alignment ${index + 1} of ${scanbodies.length}…`;
      await new Promise((resolve) => setTimeout(resolve, 10));
      clearAlignmentMarker(scanbody);
      const preparation = strategy.prepareInitialAlignment(library, scanbody);
      const registeredCopy = addModelFromGeometry({
        geometry: library.mesh.geometry.clone(),
        id: `registered-${scanbody.id}`,
        name: `Initial: ${library.name.replace(/\.stl$/i, "")} → ${scanbody.name.replace(/\.stl$/i, "")}`,
        bytes: library.bytes,
        type: "registered",
        isolated: true,
        groupId: scanbody.groupId,
      });
      setMeshTransform(registeredCopy.mesh, preparation.preview.matrix);
      registeredCopy.mesh.material.transparent = false;
      registeredCopy.mesh.material.opacity = 1;
      registeredCopy.mesh.material.depthWrite = true;
      registeredCopy.registrationStage = "initial";
      registeredCopy.initialAlignmentError = preparation.preview.error;
      registeredCopy.registrationMatrix = preparation.preview.matrix.clone();
      registeredCopy.registrationPreparation = preparation;
      registeredCopy.registrationFor = scanbody.id;
      registeredCopy.registrationTargetName = scanbody.name;
      registeredCopy.registrationSourceName = library.name;
      registeredCopy.libraryType = library.libraryType;
      const initialTypeLabel = registeredCopy.objectRow?.querySelector(".object-type");
      if (initialTypeLabel) initialTypeLabel.textContent = "INITIAL ALIGNMENT · REVIEW BEFORE ICP";
      scanbody.registered = true;
      applyDeviationMap(scanbody, library.mesh.geometry, preparation.preview.matrix);
      updateGroupState(scanbody.groupId);
      alignedGroupIds.add(scanbody.groupId);
    }
    const renameResult = renameRegisteredScanbodySequences(library, alignedGroupIds);
    setDeviationScale(0.5);
    updateUI();
    if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();
    const renameMessage = renameResult.renamed
      ? ` Renamed ${renameResult.renamed} scanbod${renameResult.renamed === 1 ? "y" : "ies"} by arch sequence.`
      : "";
    const ambiguityMessage = renameResult.ambiguous
      ? ` ${renameResult.ambiguous} group${renameResult.ambiguous === 1 ? " was" : "s were"} too small for orientation-based SB1 detection.`
      : "";
    showToast(`Initial alignment prepared for ${scanbodies.length} scanbod${scanbodies.length === 1 ? "y" : "ies"}.${renameMessage}${ambiguityMessage} Review the result, then run Step 2.`);
  } catch (error) {
    console.error("Initial alignment failed:", error);
    showToast(`Initial alignment failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function refineInitialRegistrations() {
  const library = [...models.values()].find((entry) => entry.type === "library");
  const preparedCopies = [...models.values()]
    .filter((entry) => entry.type === "registered" && entry.registrationStage === "initial");
  if (!library || !preparedCopies.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Running ICP refinement…";
  await new Promise((resolve) => setTimeout(resolve, 30));

  try {
    for (let index = 0; index < preparedCopies.length; index += 1) {
      const registeredCopy = preparedCopies[index];
      const scanbody = models.get(registeredCopy.registrationFor);
      if (!scanbody) continue;
      loading.querySelector("p").textContent = `ICP refinement ${index + 1} of ${preparedCopies.length}…`;
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = refinePreparedRegistration(registeredCopy.registrationPreparation);
      setMeshTransform(registeredCopy.mesh, result.matrix);
      registeredCopy.name = `${library.name.replace(/\.stl$/i, "")} → ${scanbody.name.replace(/\.stl$/i, "")}`;
      const objectName = registeredCopy.objectRow?.querySelector(".object-name");
      if (objectName) {
        objectName.textContent = registeredCopy.name;
        objectName.title = registeredCopy.name;
      }
      const finalTypeLabel = registeredCopy.objectRow?.querySelector(".object-type");
      if (finalTypeLabel) finalTypeLabel.textContent = TYPE_CONFIG.registered.label;
      registeredCopy.registrationStage = "final";
      registeredCopy.registrationError = result.error;
      registeredCopy.icpRegistrationMatrix = result.matrix.clone();
      registeredCopy.registrationMatrix = result.matrix.clone();
      registeredCopy.planeRefinementCompleted = false;
      delete registeredCopy.registrationPreparation;
      applyDeviationMap(scanbody, library.mesh.geometry, result.matrix);
      updateGroupState(scanbody.groupId);
    }
    setDeviationScale(0.5);
    updateUI();
    if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();
    showToast(`ICP refinement and deviation maps completed for ${preparedCopies.length} scanbod${preparedCopies.length === 1 ? "y" : "ies"}.`);
  } catch (error) {
    console.error("ICP refinement failed:", error);
    showToast(`ICP refinement failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function refineRegistrationPlanes() {
  const library = [...models.values()].find((entry) => entry.type === "library");
  const registeredCopies = [...models.values()].filter((entry) => (
    entry.type === "registered"
    && entry.registrationStage === "final"
    && !entry.planeRefinementCompleted
    && entry.icpRegistrationMatrix
  ));
  if (!library || !registeredCopies.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Refining top and side planes…";
  await new Promise((resolve) => setTimeout(resolve, 30));

  try {
    let refinedCount = 0;
    let partialCount = 0;
    let unchangedCount = 0;
    const refinedGroupIds = new Set();
    for (let index = 0; index < registeredCopies.length; index += 1) {
      const registeredCopy = registeredCopies[index];
      const scanbody = models.get(registeredCopy.registrationFor);
      if (!scanbody) continue;
      loading.querySelector("p").textContent = `Plane refinement ${index + 1} of ${registeredCopies.length}…`;
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = planeRefinementMatrix(
        library.mesh.geometry,
        scanbody.mesh.geometry,
        registeredCopy.icpRegistrationMatrix,
      );
      const correctionCount = Number(result.rotationApplied) + Number(result.translationApplied);
      if (correctionCount === 2) refinedCount += 1;
      else if (correctionCount === 1) partialCount += 1;
      else unchangedCount += 1;

      setMeshTransform(registeredCopy.mesh, result.matrix);
      registeredCopy.registrationMatrix = result.matrix.clone();
      registeredCopy.registrationStage = "plane-refined";
      registeredCopy.planeRefinementCompleted = true;
      registeredCopy.planeRefinement = {
        rotation_applied: result.rotationApplied,
        rotation_degrees_about_local_z: result.rotationDegrees,
        translation_applied: result.translationApplied,
        translation_mm_along_local_z: result.translationMillimeters,
      };

      const typeLabel = registeredCopy.objectRow?.querySelector(".object-type");
      if (typeLabel) {
        if (correctionCount === 2) typeLabel.textContent = "PLANE REFINED";
        else if (correctionCount === 1) {
          typeLabel.textContent = `PLANE REFINED · ${result.rotationApplied ? "SIDE ONLY" : "TOP ONLY"}`;
        } else {
          typeLabel.textContent = "REFINEMENT SKIPPED";
        }
      }
      applyDeviationMap(scanbody, library.mesh.geometry, result.matrix);
      updateGroupState(scanbody.groupId);
      refinedGroupIds.add(scanbody.groupId);
    }
    const renameResult = renameRegisteredScanbodySequences(library, refinedGroupIds);
    setDeviationScale(0.5);
    updateUI();
    if (!registrationMatrixWindow.hidden) renderRegistrationMatrices();
    const renameMessage = renameResult.renamed
      ? ` Renamed ${renameResult.renamed} scanbod${renameResult.renamed === 1 ? "y" : "ies"} by arch sequence.`
      : "";
    const ambiguityMessage = renameResult.ambiguous
      ? ` ${renameResult.ambiguous} group${renameResult.ambiguous === 1 ? " was" : "s were"} too small for orientation-based SB1 detection.`
      : "";
    showToast(
      `Plane refinement completed: ${refinedCount} refined, ${partialCount} partially refined, ${unchangedCount} unchanged.${renameMessage}${ambiguityMessage}`,
    );
  } catch (error) {
    console.error("Plane refinement failed:", error);
    showToast(`Plane refinement failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function uploadFiles(fileCollection, type) {
  const files = [...fileCollection].filter((file) => file.name.toLowerCase().endsWith(".stl"));
  if (!files.length) {
    showToast("Choose an STL file.", "error");
    return;
  }
  if (type === "library" && files.length > 1) {
    showToast("Scan Body Library accepts one STL file only.", "error");
    return;
  }

  loading.hidden = false;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok && !payload.files?.length) throw new Error(payload.error || "The upload could not be completed.");

    if (type === "library" && payload.files?.length) {
      [...models.values()]
        .filter((entry) => entry.type === "registered")
        .forEach((entry) => removeModel(entry.id, false));
      [...models.values()]
        .filter((entry) => entry.type === "scan" && entry.registered)
        .forEach((entry) => {
          entry.registered = false;
          clearDeviationMap(entry, entry.color || TYPE_CONFIG.scan.color);
          clearAlignmentMarker(entry);
        });
      const existingLibrary = [...models.values()].find((entry) => entry.type === "library");
      if (existingLibrary) removeModel(existingLibrary.id, false);
    }

    for (const fileRecord of payload.files || []) {
      try {
        await loadUploadedModel(fileRecord, type);
      } catch (error) {
        console.error(`Could not render ${fileRecord.name}:`, error);
        showToast(`${fileRecord.name} could not be rendered: ${error.message || "unknown parsing error"}`, "error");
      }
    }

    (payload.rejected || []).forEach((item) => showToast(`${item.name}: ${item.reason}`, "error"));
    if (payload.files?.length) invalidateFeatureDetection();
    updateSceneReference();
    updateUI();
    if (payload.files?.length) fitView();
  } catch (error) {
    showToast(error.message || "Something went wrong while loading the files.", "error");
  } finally {
    loading.hidden = true;
    (type === "library" ? libraryInput : scansInput).value = "";
  }
}

function assessmentMatrixFromRows(rows) {
  if (!Array.isArray(rows) || rows.length !== 4 || rows.some((row) => !Array.isArray(row) || row.length !== 4)) {
    throw new Error("A scanbody contains an invalid 4×4 matrix.");
  }
  const values = rows.flat().map(Number);
  if (values.some((value) => !Number.isFinite(value))) throw new Error("A transformation matrix contains non-numeric values.");
  return new THREE.Matrix4().set(...values);
}

function normalizedAssessmentScans(data) {
  const scans = data?.full_arch_scans || data?.scans;
  if (!Array.isArray(scans)) {
    throw new Error("JSON must contain a full_arch_scans array exported by Data Processing.");
  }
  return scans.map((scan, index) => ({
    name: scan.full_arch_scan_name || scan.scan_name || `Full-arch scan ${index + 1}`,
    id: scan.full_arch_scan_group_id || scan.scan_group_id || `assessment-scan-${index + 1}`,
    scanbodies: Array.isArray(scan.scanbodies) ? scan.scanbodies : [],
  }));
}

function assessmentScansForDataset(datasetId) {
  const dataset = assessmentDataGroups.get(datasetId);
  if (!dataset) return [];
  return dataset.files.flatMap((fileRecord, fileIndex) => fileRecord.scans.map((scan, scanIndex) => ({
    scan,
    fileRecord,
    fileIndex,
    scanIndex,
  })));
}

function assessmentScanPairsForDataset(datasetId) {
  const scans = assessmentScansForDataset(datasetId);
  const pairs = [];
  for (let sourceIndex = 0; sourceIndex < scans.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < scans.length; targetIndex += 1) {
      pairs.push({
        source: scans[sourceIndex],
        target: scans[targetIndex],
        sourceIndex,
        targetIndex,
      });
    }
  }
  return pairs;
}

function clearAssessmentRegistrations() {
  [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .forEach((dataset) => assessmentScansForDataset(dataset.id).forEach(({ scan }) => {
      delete scan.assessmentRegistrationMatrix;
      delete scan.assessmentRegistration;
    }));
  if (!assessmentAlignmentWindow.hidden && activeAssessmentModalReport === "trueness") renderAssessmentAlignmentReport();
}

function assessmentScanbodyPairs(sourceScan, targetScan) {
  if (sourceScan.scanbodies.length === targetScan.scanbodies.length) {
    return sourceScan.scanbodies.map((scanbody, index) => [scanbody, targetScan.scanbodies[index]]);
  }
  return [];
}

function assessmentScanbodyOrigin(scanbody) {
  return new THREE.Vector3().setFromMatrixPosition(assessmentMatrixFromRows(scanbody.matrix_4x4_row_major));
}

function assessmentScanbodyRmsError(scanbody) {
  const candidates = [
    scanbody.rms_error_mm,
    scanbody.rmsErrorMm,
    scanbody.rms,
    scanbody.registration?.rms_error_mm,
    scanbody.registration?.rms,
  ].map(Number);
  return candidates.find((value) => Number.isFinite(value) && value > 0) || null;
}

function assessmentOriginKabschScanbodyWeight(sourceScanbody, targetScanbody, mode = activeAssessmentKabschWeightMode) {
  const sourceRms = assessmentScanbodyRmsError(sourceScanbody);
  const targetRms = assessmentScanbodyRmsError(targetScanbody);
  if (!sourceRms || !targetRms || mode === "uniform") return 1;
  if (mode === "inv") return 1 / (sourceRms + targetRms + ASSESSMENT_KABSCH_WEIGHT_EPSILON);
  return 1 / (sourceRms * sourceRms + targetRms * targetRms + ASSESSMENT_KABSCH_WEIGHT_EPSILON);
}

function assessmentWeightedCentroid(points, weights = null) {
  if (!weights) return pointCentroid(points);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return pointCentroid(points);
  return points.reduce(
    (sum, point, index) => sum.addScaledVector(point, weights[index]),
    new THREE.Vector3(),
  ).multiplyScalar(1 / totalWeight);
}

function assessmentOriginsAreNonCollinear(points) {
  if (points.length < 3) return false;
  const origin = points[0];
  for (let first = 1; first < points.length - 1; first += 1) {
    const a = points[first].clone().sub(origin);
    if (a.lengthSq() < 1e-12) continue;
    for (let second = first + 1; second < points.length; second += 1) {
      const b = points[second].clone().sub(origin);
      if (a.clone().cross(b).lengthSq() > 1e-10) return true;
    }
  }
  return false;
}

function assessmentOriginKabschCorrespondences(sourceScan, targetScan, { weighted = false, weightMode = activeAssessmentKabschWeightMode } = {}) {
  const pairs = assessmentScanbodyPairs(sourceScan, targetScan);
  if (!pairs.length) {
    throw new Error(`${sourceScan.name} has ${sourceScan.scanbodies.length} scanbodies, but ${targetScan.name} has ${targetScan.scanbodies.length}.`);
  }

  const sourcePoints = [];
  const targetPoints = [];
  const weights = [];

  pairs.forEach(([sourceScanbody, targetScanbody]) => {
    sourcePoints.push(assessmentScanbodyOrigin(sourceScanbody));
    targetPoints.push(assessmentScanbodyOrigin(targetScanbody));
    weights.push(weighted ? assessmentOriginKabschScanbodyWeight(sourceScanbody, targetScanbody, weightMode) : 1);
  });

  if (!assessmentOriginsAreNonCollinear(sourcePoints) || !assessmentOriginsAreNonCollinear(targetPoints)) {
    throw new Error("Kabsch alignment requires at least 3 non-collinear scanbody origins.");
  }

  return {
    pairs,
    sourcePoints,
    targetPoints,
    weights,
    correspondenceCount: sourcePoints.length,
  };
}

function assessmentScanSurfacePoints(scan, registrationMatrix = new THREE.Matrix4(), maximumPerScanbody = 420) {
  if (!assessmentLibrary) return [];
  return scan.scanbodies.flatMap((scanbody) => {
    const sourceMatrix = assessmentMatrixFromRows(scanbody.matrix_4x4_row_major);
    const transform = registrationMatrix.clone().multiply(sourceMatrix);
    return sampleGeometryPoints(assessmentLibrary.mesh.geometry, maximumPerScanbody)
      .map((point) => point.applyMatrix4(transform));
  });
}

function assessmentReferenceForRegistration(registration) {
  const referenceScans = assessmentScansForDataset("reference");
  return referenceScans.find(({ scan, fileRecord, scanIndex }) => (
    fileRecord.id === registration.referenceFileId
    && scanIndex === registration.referenceScanIndex
  )) || referenceScans.find(({ scan, fileRecord }) => (
    scan.name === registration.referenceScanName
    && fileRecord.name === registration.referenceFileName
  ));
}

function assessmentKabschLargestEigenvector(input) {
  const matrix = input.map((row) => row.slice());
  const eigenvectors = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  for (let iteration = 0; iteration < 60; iteration += 1) {
    let pivotRow = 0;
    let pivotColumn = 1;
    let maximum = 0;
    for (let row = 0; row < 4; row += 1) {
      for (let column = row + 1; column < 4; column += 1) {
        const value = Math.abs(matrix[row][column]);
        if (value > maximum) {
          maximum = value;
          pivotRow = row;
          pivotColumn = column;
        }
      }
    }
    if (maximum < 1e-12) break;

    const app = matrix[pivotRow][pivotRow];
    const aqq = matrix[pivotColumn][pivotColumn];
    const apq = matrix[pivotRow][pivotColumn];
    const angle = 0.5 * Math.atan2(2 * apq, aqq - app);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    for (let index = 0; index < 4; index += 1) {
      if (index === pivotRow || index === pivotColumn) continue;
      const rowValue = matrix[index][pivotRow];
      const columnValue = matrix[index][pivotColumn];
      matrix[index][pivotRow] = rowValue * cosine - columnValue * sine;
      matrix[pivotRow][index] = matrix[index][pivotRow];
      matrix[index][pivotColumn] = rowValue * sine + columnValue * cosine;
      matrix[pivotColumn][index] = matrix[index][pivotColumn];
    }

    matrix[pivotRow][pivotRow] = app * cosine * cosine - 2 * apq * cosine * sine + aqq * sine * sine;
    matrix[pivotColumn][pivotColumn] = app * sine * sine + 2 * apq * cosine * sine + aqq * cosine * cosine;
    matrix[pivotRow][pivotColumn] = 0;
    matrix[pivotColumn][pivotRow] = 0;

    for (let index = 0; index < 4; index += 1) {
      const rowValue = eigenvectors[index][pivotRow];
      const columnValue = eigenvectors[index][pivotColumn];
      eigenvectors[index][pivotRow] = rowValue * cosine - columnValue * sine;
      eigenvectors[index][pivotColumn] = rowValue * sine + columnValue * cosine;
    }
  }

  let largestIndex = 0;
  for (let index = 1; index < 4; index += 1) {
    if (matrix[index][index] > matrix[largestIndex][largestIndex]) largestIndex = index;
  }
  return [
    eigenvectors[0][largestIndex],
    eigenvectors[1][largestIndex],
    eigenvectors[2][largestIndex],
    eigenvectors[3][largestIndex],
  ];
}

function assessmentAssertRigidRotation(matrix) {
  const rotation = new THREE.Matrix3().setFromMatrix4(matrix);
  const elements = rotation.elements;
  const xAxis = new THREE.Vector3(elements[0], elements[1], elements[2]);
  const yAxis = new THREE.Vector3(elements[3], elements[4], elements[5]);
  const zAxis = new THREE.Vector3(elements[6], elements[7], elements[8]);
  const determinant = matrix.determinant();
  const orthogonalityError = Math.max(
    Math.abs(xAxis.length() - 1),
    Math.abs(yAxis.length() - 1),
    Math.abs(zAxis.length() - 1),
    Math.abs(xAxis.dot(yAxis)),
    Math.abs(xAxis.dot(zAxis)),
    Math.abs(yAxis.dot(zAxis)),
  );
  if (Math.abs(determinant - 1) > 1e-5 || orthogonalityError > 1e-5) {
    throw new Error("Kabsch produced a non-rigid rotation.");
  }
}

function assessmentKabschRigidTransform(sourcePoints, targetPoints, weights = null) {
  // Kabsch-style least-squares rigid registration for paired 3D landmarks.
  // This uses the quaternion/eigen form of the Kabsch solution so the result is
  // one rotation + translation, with no scale or deformation.
  const validWeights = Array.isArray(weights)
    && weights.length === sourcePoints.length
    && weights.every((weight) => Number.isFinite(weight) && weight > 0)
    ? weights
    : null;
  const sourceCenter = assessmentWeightedCentroid(sourcePoints, validWeights);
  const targetCenter = assessmentWeightedCentroid(targetPoints, validWeights);
  const covariance = Array.from({ length: 3 }, () => [0, 0, 0]);

  for (let index = 0; index < sourcePoints.length; index += 1) {
    const source = sourcePoints[index].clone().sub(sourceCenter);
    const target = targetPoints[index].clone().sub(targetCenter);
    const weight = validWeights ? validWeights[index] : 1;
    covariance[0][0] += weight * source.x * target.x;
    covariance[0][1] += weight * source.x * target.y;
    covariance[0][2] += weight * source.x * target.z;
    covariance[1][0] += weight * source.y * target.x;
    covariance[1][1] += weight * source.y * target.y;
    covariance[1][2] += weight * source.y * target.z;
    covariance[2][0] += weight * source.z * target.x;
    covariance[2][1] += weight * source.z * target.y;
    covariance[2][2] += weight * source.z * target.z;
  }

  const [sxx, sxy, sxz] = covariance[0];
  const [syx, syy, syz] = covariance[1];
  const [szx, szy, szz] = covariance[2];
  const eigenMatrix = [
    [sxx + syy + szz, syz - szy, szx - sxz, sxy - syx],
    [syz - szy, sxx - syy - szz, sxy + syx, szx + sxz],
    [szx - sxz, sxy + syx, -sxx + syy - szz, syz + szy],
    [sxy - syx, szx + sxz, syz + szy, -sxx - syy + szz],
  ];
  const eigenvector = assessmentKabschLargestEigenvector(eigenMatrix);
  const rotation = new THREE.Quaternion(
    eigenvector[1],
    eigenvector[2],
    eigenvector[3],
    eigenvector[0],
  ).normalize();
  const translation = targetCenter.clone().sub(sourceCenter.clone().applyQuaternion(rotation));
  const matrix = new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1));
  assessmentAssertRigidRotation(matrix);
  return matrix;
}

function assessmentInitialScanAlignment(sourceScan, targetScan, options = {}) {
  const mode = options.mode === "weighted-origin" ? "weighted-origin" : "origin";
  const weighted = mode === "weighted-origin";
  const weightMode = options.weightMode || activeAssessmentKabschWeightMode;
  const correspondence = assessmentOriginKabschCorrespondences(sourceScan, targetScan, {
    weighted,
    weightMode,
  });
  const matrix = assessmentKabschRigidTransform(
    correspondence.sourcePoints,
    correspondence.targetPoints,
    weighted ? correspondence.weights : null,
  );
  const weightedError = correspondence.sourcePoints.reduce((sum, point, index) => {
    const weight = weighted ? correspondence.weights[index] : 1;
    return sum + weight * point.clone().applyMatrix4(matrix).distanceToSquared(correspondence.targetPoints[index]);
  }, 0);
  const weightSum = weighted
    ? correspondence.weights.reduce((sum, weight) => sum + weight, 0)
    : correspondence.sourcePoints.length;
  const scanbodyDistances = assessmentScanbodyDistances(sourceScan, targetScan, matrix);
  return {
    matrix,
    rms: Math.sqrt(weightedError / Math.max(weightSum, 1e-6)),
    matchedScanbodies: correspondence.pairs.length,
    correspondenceCount: correspondence.correspondenceCount,
    method: weighted ? `weighted-origin-kabsch-${weightMode}` : "origin-kabsch",
    weighting: weighted ? weightMode : "uniform",
    scanbodyDistances,
  };
}

function assessmentPrecisionPairMeasurement(sourceItem, targetItem) {
  const sourceScan = sourceItem.scan;
  const targetScan = targetItem.scan;
  const pairs = assessmentScanbodyPairs(sourceScan, targetScan);
  if (!pairs.length) return null;

  const sourcePoints = pairs.map(([scanbody]) => assessmentScanbodyOrigin(scanbody));
  const targetPoints = pairs.map(([, scanbody]) => assessmentScanbodyOrigin(scanbody));
  const matrix = assessmentKabschRigidTransform(sourcePoints, targetPoints);
  const scanbodyDistances = assessmentScanbodyDistances(sourceScan, targetScan, matrix);
  const distances = scanbodyDistances.map((item) => item.distance).filter(Number.isFinite);
  const stats = deviationStats(distances);
  if (!stats) return null;

  return {
    id: `${sourceItem.fileRecord.id}-${sourceItem.scanIndex}-${targetItem.fileRecord.id}-${targetItem.scanIndex}`,
    name: `${sourceScan.name} <-> ${targetScan.name}`,
    sourceScanName: sourceScan.name,
    targetScanName: targetScan.name,
    sourceFileName: sourceItem.fileRecord.name,
    targetFileName: targetItem.fileRecord.name,
    sourceFileId: sourceItem.fileRecord.id,
    targetFileId: targetItem.fileRecord.id,
    sourceScanIndex: sourceItem.scanIndex,
    targetScanIndex: targetItem.scanIndex,
    matchedScanbodies: pairs.length,
    matrix,
    scanbodyDistances,
    stats,
  };
}

function availablePrecisionPairCount() {
  return [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .reduce((sum, dataset) => {
      const compatiblePairs = assessmentScanPairsForDataset(dataset.id)
        .filter(({ source, target }) => source.scan.scanbodies.length === target.scan.scanbodies.length);
      return sum + compatiblePairs.length;
    }, 0);
}

function precisionMeasuredPairCount() {
  return [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .reduce((sum, dataset) => sum + (dataset.precisionAssessment?.pairs?.length || 0), 0);
}

function assessmentScanbodyDistances(sourceScan, targetScan, registrationMatrix) {
  const pairs = assessmentScanbodyPairs(sourceScan, targetScan);
  return pairs.map(([sourceScanbody, targetScanbody], index) => {
    const sourcePoint = assessmentScanbodyOrigin(sourceScanbody);
    const targetPoint = assessmentScanbodyOrigin(targetScanbody);
    const alignedSource = sourcePoint.applyMatrix4(registrationMatrix);
    return {
      index: index + 1,
      sourceName: sourceScanbody.scanbody_name || `${sourceScan.name} SB${index + 1}`,
      targetName: targetScanbody.scanbody_name || `${targetScan.name} SB${index + 1}`,
      distance: alignedSource.distanceTo(targetPoint),
    };
  });
}

function refreshAssessmentAlignmentReportData() {
  [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .forEach((dataset) => assessmentScansForDataset(dataset.id).forEach(({ scan }) => {
      if (!scan.assessmentRegistrationMatrix || !scan.assessmentRegistration) return;
      const reference = assessmentReferenceForRegistration(scan.assessmentRegistration);
      if (!reference) return;
      scan.assessmentRegistration.scanbodyDistances = assessmentScanbodyDistances(
        scan,
        reference.scan,
        scan.assessmentRegistrationMatrix,
      );
    }));
  if (!assessmentAlignmentWindow.hidden) {
    if (activeAssessmentModalReport === "precision") renderAssessmentPrecisionReport();
    else renderAssessmentAlignmentReport();
  }
  renderReportModule();
}

function runAssessmentPrecisionMeasure() {
  const testDatasets = [...assessmentDataGroups.values()].filter((dataset) => dataset.type === "test");
  const availablePairs = availablePrecisionPairCount();
  if (!availablePairs) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Measuring within-group precision…";
  assessmentRegistrationStatus.className = "assessment-registration-status";

  try {
    let measuredPairs = 0;
    let skippedPairs = 0;
    testDatasets.forEach((dataset) => {
      const pairs = assessmentScanPairsForDataset(dataset.id);
      const measurements = [];
      pairs.forEach(({ source, target }) => {
        const measurement = assessmentPrecisionPairMeasurement(source, target);
        if (measurement) measurements.push(measurement);
        else skippedPairs += 1;
      });
      if (measurements.length) {
        const distances = measurements.flatMap((pair) => (
          pair.scanbodyDistances.map((item) => item.distance).filter(Number.isFinite)
        ));
        dataset.precisionAssessment = {
          measuredAt: new Date().toISOString(),
          pairs: measurements,
          stats: deviationStats(distances),
        };
        measuredPairs += measurements.length;
      } else {
        delete dataset.precisionAssessment;
      }
    });

    if (!measuredPairs) throw new Error("No compatible scan pairs found. Each pair must have the same scanbody count.");
    assessmentRegistrationStatus.textContent =
      `Precision measured for ${measuredPairs} scan pair${measuredPairs === 1 ? "" : "s"}`;
    assessmentRegistrationStatus.classList.add("complete");
    if (!assessmentAlignmentWindow.hidden && activeAssessmentModalReport === "precision") renderAssessmentPrecisionReport();
    renderReportModule();
    updateAssessmentUI();
    showToast(`Measured precision for ${measuredPairs} within-group scan pair${measuredPairs === 1 ? "" : "s"}${skippedPairs ? `; skipped ${skippedPairs} incompatible pair${skippedPairs === 1 ? "" : "s"}` : ""}.`);
  } catch (error) {
    assessmentRegistrationStatus.textContent = error.message;
    assessmentRegistrationStatus.classList.add("error");
    showToast(`Precision measurement failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

function runAssessmentInitialAlignment() {
  const referenceScans = assessmentScansForDataset("reference");
  const testDatasets = [...assessmentDataGroups.values()].filter((dataset) => dataset.type === "test");
  const testScans = testDatasets.flatMap((dataset) => (
    assessmentScansForDataset(dataset.id).map((item) => ({ ...item, dataset }))
  ));
  if (!referenceScans.length || !testScans.length) return;
  const kabschMode = activeAssessmentKabschMode === "weighted-origin" ? "weighted-origin" : "origin";
  const weightMode = activeAssessmentKabschWeightMode;
  const kabschLabel = kabschMode === "weighted-origin"
    ? `origins, ${weightMode}`
    : "origins";

  loading.hidden = false;
  loading.querySelector("p").textContent = `Running Kabsch alignment (${kabschLabel})…`;
  assessmentRegistrationStatus.className = "assessment-registration-status";

  try {
    const registrations = testScans.map(({ scan, dataset }) => {
      const candidates = referenceScans.map((reference) => {
        try {
          return { reference, ...assessmentInitialScanAlignment(scan, reference.scan, { mode: kabschMode, weightMode }) };
        } catch (_error) {
          return null;
        }
      }).filter(Boolean);
      if (!candidates.length) throw new Error(`${scan.name} has no compatible reference scan.`);
      candidates.sort((first, second) => (
        second.matchedScanbodies - first.matchedScanbodies || first.rms - second.rms
      ));
      const best = candidates[0];
      return { scan, dataset, best };
    });
    registrations.forEach(({ scan, dataset, best }) => {
      scan.assessmentRegistrationMatrix = best.matrix.clone();
      scan.assessmentRegistration = {
        referenceScanName: best.reference.scan.name,
        referenceFileName: best.reference.fileRecord.name,
        referenceFileId: best.reference.fileRecord.id,
        referenceScanIndex: best.reference.scanIndex,
        rms: best.rms,
        matchedScanbodies: best.matchedScanbodies,
        correspondenceCount: best.correspondenceCount,
        datasetName: dataset.name,
        method: `initial-${best.method}`,
        kabschMode,
        kabschWeighting: best.weighting,
        scanbodyDistances: best.scanbodyDistances,
      };
    });
    rebuildAssessmentScene({ refitView: false });
    refreshAssessmentAlignmentReportData();
    assessmentRegistrationStatus.textContent =
      `Kabsch aligned ${registrations.length} scan${registrations.length === 1 ? "" : "s"} (${kabschLabel})`;
    assessmentRegistrationStatus.classList.add("complete");
    showToast(`Kabsch aligned ${registrations.length} full-arch test scan${registrations.length === 1 ? "" : "s"} to the reference group (${kabschLabel}).`);
  } catch (error) {
    assessmentRegistrationStatus.textContent = error.message;
    assessmentRegistrationStatus.classList.add("error");
    showToast(`Initial alignment failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

function applyAssessmentDeviationMap(entry, targetPoints) {
  entry.mesh.updateMatrixWorld(true);
  const targetTree = buildKdTree(targetPoints);
  const displayGeometry = prepareDeviationDisplayGeometry(entry);
  const position = displayGeometry.getAttribute("position");
  const distances = [];
  for (let index = 0; index < position.count; index += 1) {
    const point = new THREE.Vector3(position.getX(index), position.getY(index), position.getZ(index))
      .applyMatrix4(entry.mesh.matrixWorld);
    distances.push(Math.sqrt(nearestPoint(targetTree, targetPoints, point).distanceSquared));
  }
  entry.deviationDistances = new Float32Array(distances);
  colorizeDeviationEntry(entry, deviationScaleMaximum);
}

function applyAssessmentRefinedDeviationMaps() {
  const testDatasets = [...assessmentDataGroups.values()].filter((dataset) => dataset.type === "test");
  testDatasets.forEach((dataset) => {
    assessmentScansForDataset(dataset.id).forEach(({ scan, fileIndex, scanIndex }) => {
      const registration = scan.assessmentRegistration;
      if (!registration?.refined) return;
      const reference = assessmentReferenceForRegistration(registration);
      if (!reference) return;
      const targetPoints = assessmentScanSurfacePoints(reference.scan, new THREE.Matrix4(), 700);
      const groupId = `${dataset.id}-file-${fileIndex + 1}-scan-${scanIndex + 1}`;
      const group = assessmentScanGroups.get(groupId);
      group?.childIds.forEach((id) => {
        const entry = assessmentModels.get(id);
        if (entry) applyAssessmentDeviationMap(entry, targetPoints);
      });
    });
  });
}

function runAssessmentRefinedAlignment() {
  const testDatasets = [...assessmentDataGroups.values()].filter((dataset) => dataset.type === "test");
  const testScans = testDatasets.flatMap((dataset) => (
    assessmentScansForDataset(dataset.id).map((item) => ({ ...item, dataset }))
  ));
  const alignedScans = testScans.filter(({ scan }) => scan.assessmentRegistrationMatrix && scan.assessmentRegistration);
  if (!alignedScans.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Running refined surface ICP alignment...";
  assessmentRegistrationStatus.className = "assessment-registration-status";

  try {
    const refinements = alignedScans.map(({ scan }) => {
      const reference = assessmentReferenceForRegistration(scan.assessmentRegistration);
      if (!reference) throw new Error(`${scan.name} has no matched reference scan for refined alignment.`);
      const initialMatrix = scan.assessmentRegistrationMatrix || new THREE.Matrix4();
      const sourcePoints = assessmentScanSurfacePoints(scan, initialMatrix, 520);
      const targetPoints = assessmentScanSurfacePoints(reference.scan, new THREE.Matrix4(), 700);
      if (!sourcePoints.length || !targetPoints.length) throw new Error(`${scan.name} does not have enough surface points for ICP.`);
      const result = refineRegistration(sourcePoints, targetPoints, new THREE.Matrix4());
      return { scan, result, reference };
    });

    refinements.forEach(({ scan, result, reference }) => {
      scan.assessmentRegistrationMatrix = result.matrix.clone().multiply(scan.assessmentRegistrationMatrix || new THREE.Matrix4());
      scan.assessmentRegistration = {
        ...scan.assessmentRegistration,
        referenceScanName: reference.scan.name,
        referenceFileName: reference.fileRecord.name,
        referenceFileId: reference.fileRecord.id,
        referenceScanIndex: reference.scanIndex,
        refined: {
          method: "surface-icp",
          rms: result.error,
        },
      };
    });

    rebuildAssessmentScene({ refitView: false });
    refreshAssessmentAlignmentReportData();
    applyAssessmentRefinedDeviationMaps();
    updateDeviationLegendState();
    assessmentRegistrationStatus.textContent =
      `${refinements.length} test scan${refinements.length === 1 ? "" : "s"} refined with surface ICP`;
    assessmentRegistrationStatus.classList.add("complete");
    showToast(`Refined ${refinements.length} full-arch test scan${refinements.length === 1 ? "" : "s"} with surface ICP.`);
  } catch (error) {
    assessmentRegistrationStatus.textContent = error.message;
    assessmentRegistrationStatus.classList.add("error");
    showToast(`Refined alignment failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry...";
  }
}

function initializeAssessmentDataGroups() {
  assessmentDataGroups.clear();
  assessmentDataGroups.set("reference", {
    id: "reference",
    type: "reference",
    name: "Reference group",
    color: "#55cfff",
    files: [],
    collapsed: true,
  });
  assessmentDataGroups.set("test-group-1", {
    id: "test-group-1",
    type: "test",
    name: "Group 1",
    nameEdited: false,
    color: ASSESSMENT_GROUP_COLORS[0],
    files: [],
    collapsed: true,
  });
  nextAssessmentTestGroup = 2;
}

function createAssessmentTestGroup() {
  const number = nextAssessmentTestGroup++;
  const group = {
    id: `test-group-${number}`,
    type: "test",
    name: `Group ${number}`,
    nameEdited: false,
    color: ASSESSMENT_GROUP_COLORS[(number - 1) % ASSESSMENT_GROUP_COLORS.length],
    files: [],
    collapsed: true,
  };
  assessmentDataGroups.set(group.id, group);
  renderAssessmentDataGroups();
  updateAssessmentUI();
  return group;
}

function assessmentHasTransformationFiles() {
  return [...assessmentDataGroups.values()].some((group) => group.files.length);
}

function assessmentFileSummary(fileRecord) {
  const bodyCount = fileRecord.scans.reduce((sum, scan) => sum + scan.scanbodies.length, 0);
  return `${fileRecord.scans.length} scans · ${bodyCount} scanbodies`;
}

function assessmentGroupNameFromFile(fileName) {
  return fileName.replace(/\.json$/i, "").trim() || fileName;
}

function setAssessmentDataGroupColor(groupId, colorValue) {
  const dataset = assessmentDataGroups.get(groupId);
  if (!dataset || !/^#[0-9a-f]{6}$/i.test(colorValue)) return;
  dataset.color = colorValue.toLowerCase();
  const color = new THREE.Color(dataset.color);
  [...assessmentScanGroups.values()]
    .filter((group) => group.datasetGroupId === groupId)
    .forEach((group) => {
      group.color = color.clone();
      group.childIds.forEach((id) => {
        const entry = assessmentModels.get(id);
        if (!entry) return;
        entry.color = color.clone();
        entry.mesh.material.color.copy(color);
        entry.mesh.material.needsUpdate = true;
        setLocalOriginMarkerColor(entry, color);
      });
    });
  renderAssessmentObjects();
  renderReportModule();
}

function renderAssessmentFileList(group) {
  if (!group.files.length) return '<span class="assessment-files-empty">No files added</span>';
  return group.files.map((fileRecord) => `
    <div class="assessment-file-row">
      <span><strong>${escapeHTML(fileRecord.name)}</strong><small>${assessmentFileSummary(fileRecord)}</small></span>
      <button type="button" data-remove-assessment-file="${fileRecord.id}" data-group-id="${group.id}" aria-label="Remove ${escapeHTML(fileRecord.name)}">×</button>
    </div>
  `).join("");
}

function bindAssessmentDataGroupControls(root) {
  root.querySelectorAll("[data-add-assessment-files]").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelector(`[data-assessment-file-input="${button.dataset.addAssessmentFiles}"]`)?.click();
    });
  });
  root.querySelectorAll("[data-assessment-file-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      await importAssessmentJsonFiles(input.dataset.assessmentFileInput, input.files);
      input.value = "";
    });
  });
  root.querySelectorAll("[data-assessment-data-group]").forEach((card) => {
    const groupId = card.dataset.assessmentDataGroup;
    ["dragenter", "dragover"].forEach((eventType) => card.addEventListener(eventType, (event) => {
      event.preventDefault();
      card.classList.add("dragging");
    }));
    ["dragleave", "drop"].forEach((eventType) => card.addEventListener(eventType, (event) => {
      event.preventDefault();
      card.classList.remove("dragging");
    }));
    card.addEventListener("drop", (event) => importAssessmentJsonFiles(groupId, event.dataTransfer.files));
  });
  root.querySelectorAll("[data-test-group-name]").forEach((input) => {
    input.addEventListener("change", () => {
      const group = assessmentDataGroups.get(input.dataset.testGroupName);
      if (!group) return;
      group.name = input.value.trim() || `Group ${input.dataset.testGroupName.split("-").pop()}`;
      group.nameEdited = true;
      input.value = group.name;
      renderAssessmentObjects();
      renderReportModule();
    });
  });
  root.querySelectorAll("[data-assessment-group-color]").forEach((input) => {
    input.addEventListener("input", () => {
      setAssessmentDataGroupColor(input.dataset.assessmentGroupColor, input.value);
    });
  });
  root.querySelectorAll("[data-remove-test-group]").forEach((button) => {
    button.addEventListener("click", () => {
      assessmentDataGroups.delete(button.dataset.removeTestGroup);
      rebuildAssessmentScene();
      renderAssessmentDataGroups();
    });
  });
  root.querySelectorAll("[data-remove-assessment-file]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = assessmentDataGroups.get(button.dataset.groupId);
      if (!group) return;
      if (group.type === "reference") clearAssessmentRegistrations();
      if (group.type === "test") delete group.precisionAssessment;
      group.files = group.files.filter((fileRecord) => fileRecord.id !== button.dataset.removeAssessmentFile);
      rebuildAssessmentScene();
      renderAssessmentDataGroups();
    });
  });
}

function renderAssessmentDataGroups() {
  const reference = assessmentDataGroups.get("reference");
  referenceGroupColor.value = reference.color;
  referenceFileList.innerHTML = renderAssessmentFileList(reference);
  document.querySelector("#reference-file-count").textContent =
    `${reference.files.length} FILE${reference.files.length === 1 ? "" : "S"}`;
  bindAssessmentDataGroupControls(referenceFileList);

  const testGroups = [...assessmentDataGroups.values()].filter((group) => group.type === "test");
  testGroupsContainer.innerHTML = testGroups.length ? testGroups.map((group) => `
    <article class="assessment-data-card test-data-card" data-assessment-data-group="${group.id}">
      <div class="assessment-data-card-header">
        <div class="test-group-title">
          <span class="assessment-group-kind">TEST GROUP</span>
          <input type="text" value="${escapeHTML(group.name)}" data-test-group-name="${group.id}" aria-label="Test group name" />
        </div>
        <div class="assessment-group-header-actions">
          <label class="assessment-color-control" title="${escapeHTML(group.name)} color">
            <span>COLOR</span>
            <input type="color" value="${group.color}" data-assessment-group-color="${group.id}" aria-label="${escapeHTML(group.name)} color" />
          </label>
          <button class="remove-test-group" type="button" data-remove-test-group="${group.id}" aria-label="Remove ${escapeHTML(group.name)}">×</button>
        </div>
      </div>
      <input data-assessment-file-input="${group.id}" type="file" accept=".json,application/json" multiple hidden />
      <button class="assessment-group-add" data-add-assessment-files="${group.id}" type="button">
        <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7zM14 3v5h5M10 14h5m-2.5-2.5v5"/></svg>
        Add JSON files to this group
      </button>
      <div class="assessment-file-list">${renderAssessmentFileList(group)}</div>
    </article>
  `).join("") : '<div class="test-groups-empty">No test groups yet</div>';
  bindAssessmentDataGroupControls(testGroupsContainer);
}

function disposeAssessmentEntry(entry) {
  assessmentGroup.remove(entry.mesh);
  disposeLocalOriginAxes(entry);
  disposeEntryGeometry(entry);
  entry.mesh.material.dispose();
}

function clearAssessment({ keepLibrary = false } = {}) {
  [...assessmentModels.values()].forEach((entry) => {
    if (keepLibrary && entry.type === "assessment-library") return;
    disposeAssessmentEntry(entry);
    assessmentModels.delete(entry.id);
  });
  assessmentScanGroups.clear();
  if (!keepLibrary) {
    assessmentLibrary = null;
    assessmentLibraryInput.value = "";
    assessmentLibraryStatus.textContent = "No assessment library loaded";
    assessmentLibraryStatus.classList.remove("loaded");
  }
  initializeAssessmentDataGroups();
  activeAssessmentKabschMode = "origin";
  activeAssessmentKabschWeightMode = "invVar";
  referenceJsonInput.value = "";
  renderAssessmentDataGroups();
  renderAssessmentObjects();
  updateAssessmentUI();
}

function createAssessmentMesh(geometry, color, opacity = 1) {
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.06,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    wireframe: wireframeToggle.checked,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  assessmentGroup.add(mesh);
  return mesh;
}

function setAssessmentVisibility(id, visible) {
  const entry = assessmentModels.get(id);
  if (!entry) return;
  entry.userVisible = visible;
  entry.mesh.visible = activeModule === "accuracy-assessment" && visible;
  renderAssessmentObjects();
  updateAssessmentUI();
}

function setAssessmentGroupVisibility(groupId, visible) {
  const group = assessmentScanGroups.get(groupId);
  if (!group) return;
  group.childIds.forEach((id) => {
    const entry = assessmentModels.get(id);
    if (entry) {
      entry.userVisible = visible;
      entry.mesh.visible = activeModule === "accuracy-assessment" && visible;
    }
  });
  renderAssessmentObjects();
  updateAssessmentUI();
}

function setAssessmentDatasetVisibility(datasetGroupId, visible) {
  [...assessmentScanGroups.values()]
    .filter((group) => group.datasetGroupId === datasetGroupId)
    .forEach((group) => group.childIds.forEach((id) => {
      const entry = assessmentModels.get(id);
      if (entry) {
        entry.userVisible = visible;
        entry.mesh.visible = activeModule === "accuracy-assessment" && visible;
      }
    }));
  renderAssessmentObjects();
  updateAssessmentUI();
}

function renderAssessmentObjects() {
  const entries = [...assessmentModels.values()];
  if (!entries.length) {
    assessmentObjectsList.innerHTML = '<div id="assessment-objects-empty" class="objects-empty">Import a library STL and transformation groups</div>';
    return;
  }
  const libraryEntry = entries.find((entry) => entry.type === "assessment-library");
  const libraryHtml = libraryEntry ? `
    <div class="object-row assessment-library-row">
      <span class="object-swatch" style="color:#c488ff;background:#c488ff"></span>
      <span class="object-copy"><span class="object-name">${escapeHTML(libraryEntry.name)}</span><span class="object-type">ASSESSMENT LIBRARY · ORIGIN</span></span>
      <label class="visibility-switch"><input type="checkbox" data-assessment-object="${libraryEntry.id}" ${libraryEntry.userVisible ? "checked" : ""}/><span></span></label>
    </div>` : "";
  const assessmentGroupStatus = (group) => {
    if (!group.registration) return "RECONSTRUCTED";
    if (group.registration.refined) {
      return `REFINED TO ${escapeHTML(group.registration.referenceScanName)} · ICP RMS ${formatMicrometers(group.registration.refined.rms)}`;
    }
    return `INITIALLY ALIGNED TO ${escapeHTML(group.registration.referenceScanName)} · RMS ${formatMicrometers(group.registration.rms)}`;
  };
  const scanGroupHtml = (group) => {
    const children = group.childIds.map((id) => assessmentModels.get(id)).filter(Boolean);
    const visibleCount = children.filter((entry) => entry.userVisible).length;
    const childrenHtml = children.map((entry) => `
      <div class="object-row object-child-row">
        <span class="object-swatch" style="color:#${entry.color.getHexString()};background:#${entry.color.getHexString()}"></span>
        <span class="object-copy"><span class="object-name">${escapeHTML(entry.name)}</span><span class="object-type">RECONSTRUCTED FROM LIBRARY</span></span>
        <label class="visibility-switch"><input type="checkbox" data-assessment-object="${entry.id}" ${entry.userVisible ? "checked" : ""}/><span></span></label>
      </div>`).join("");
    return `
      <section class="object-group assessment-object-group ${group.collapsed ? "group-collapsed" : ""}">
        <div class="object-group-row">
          <button class="group-toggle" type="button" data-assessment-toggle="${group.id}" aria-expanded="${!group.collapsed}">
            <svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>
          </button>
          <span class="object-swatch" style="color:#${group.color.getHexString()};background:#${group.color.getHexString()}"></span>
          <span class="object-copy"><span class="object-name">${escapeHTML(group.name)}</span><span class="object-type">${children.length} SCANBODIES · ${assessmentGroupStatus(group)}</span></span>
          <label class="visibility-switch"><input type="checkbox" data-assessment-group="${group.id}" ${visibleCount === children.length && children.length ? "checked" : ""}/><span></span></label>
        </div>
        <div class="object-group-children">${childrenHtml}</div>
      </section>`;
  };
  const datasetsHtml = [...assessmentDataGroups.values()].map((dataset) => {
    const scanGroups = [...assessmentScanGroups.values()].filter((group) => group.datasetGroupId === dataset.id);
    if (!dataset.files.length && !scanGroups.length) return "";
    const datasetEntries = scanGroups.flatMap((group) => group.childIds.map((id) => assessmentModels.get(id)).filter(Boolean));
    const visibleCount = datasetEntries.filter((entry) => entry.userVisible).length;
    const typeLabel = dataset.type === "reference" ? "REFERENCE GROUP" : "TEST GROUP";
    return `
      <section class="assessment-dataset ${dataset.collapsed ? "dataset-collapsed" : ""}">
        <div class="assessment-dataset-row">
          <button class="group-toggle" type="button" data-assessment-dataset-toggle="${dataset.id}" aria-expanded="${!dataset.collapsed}">
            <svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>
          </button>
          <span class="dataset-badge ${dataset.type}" style="color:${dataset.color};border-color:${dataset.color}">${dataset.type === "reference" ? "R" : "T"}</span>
          <span class="object-copy"><span class="object-name">${escapeHTML(dataset.name)}</span><span class="object-type">${typeLabel} · ${dataset.files.length} JSON · ${scanGroups.length} SCANS</span></span>
          <label class="visibility-switch"><input type="checkbox" data-assessment-dataset="${dataset.id}" ${visibleCount === datasetEntries.length && datasetEntries.length ? "checked" : ""}/><span></span></label>
        </div>
        <div class="assessment-dataset-children">${scanGroups.map(scanGroupHtml).join("")}</div>
      </section>`;
  }).join("");
  assessmentObjectsList.innerHTML = libraryHtml + datasetsHtml;
  assessmentObjectsList.querySelectorAll("[data-assessment-object]").forEach((input) => {
    input.indeterminate = false;
    input.addEventListener("change", () => setAssessmentVisibility(input.dataset.assessmentObject, input.checked));
  });
  assessmentObjectsList.querySelectorAll("[data-assessment-group]").forEach((input) => {
    const group = assessmentScanGroups.get(input.dataset.assessmentGroup);
    const children = group.childIds.map((id) => assessmentModels.get(id)).filter(Boolean);
    const visibleCount = children.filter((entry) => entry.userVisible).length;
    input.indeterminate = visibleCount > 0 && visibleCount < children.length;
    input.addEventListener("change", () => setAssessmentGroupVisibility(input.dataset.assessmentGroup, input.checked));
  });
  assessmentObjectsList.querySelectorAll("[data-assessment-dataset]").forEach((input) => {
    const scanGroups = [...assessmentScanGroups.values()].filter((group) => group.datasetGroupId === input.dataset.assessmentDataset);
    const children = scanGroups.flatMap((group) => group.childIds.map((id) => assessmentModels.get(id)).filter(Boolean));
    const visibleCount = children.filter((entry) => entry.userVisible).length;
    input.indeterminate = visibleCount > 0 && visibleCount < children.length;
    input.addEventListener("change", () => setAssessmentDatasetVisibility(input.dataset.assessmentDataset, input.checked));
  });
  assessmentObjectsList.querySelectorAll("[data-assessment-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = assessmentScanGroups.get(button.dataset.assessmentToggle);
      group.collapsed = !group.collapsed;
      renderAssessmentObjects();
    });
  });
  assessmentObjectsList.querySelectorAll("[data-assessment-dataset-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = assessmentDataGroups.get(button.dataset.assessmentDatasetToggle);
      group.collapsed = !group.collapsed;
      renderAssessmentObjects();
    });
  });
}

function rebuildAssessmentScene({ refitView = true } = {}) {
  [...assessmentModels.values()]
    .filter((entry) => entry.type === "assessment-scanbody")
    .forEach((entry) => {
      disposeAssessmentEntry(entry);
      assessmentModels.delete(entry.id);
    });
  assessmentScanGroups.clear();
  if (!assessmentLibrary || !assessmentHasTransformationFiles()) {
    renderAssessmentObjects();
    updateAssessmentUI();
    return;
  }

  [...assessmentDataGroups.values()].forEach((dataset) => {
    dataset.files.forEach((fileRecord, fileIndex) => {
      fileRecord.scans.forEach((scan, scanIndex) => {
        const color = new THREE.Color(dataset.color);
        const groupId = `${dataset.id}-file-${fileIndex + 1}-scan-${scanIndex + 1}`;
        const group = {
          id: groupId,
          name: scan.name,
          sourceFileName: fileRecord.name,
          datasetGroupId: dataset.id,
          color,
          childIds: [],
          collapsed: true,
          registration: scan.assessmentRegistration || null,
        };
        assessmentScanGroups.set(group.id, group);
        scan.scanbodies.forEach((scanbody, bodyIndex) => {
          const sourceMatrix = assessmentMatrixFromRows(scanbody.matrix_4x4_row_major);
          const registrationMatrix = scan.assessmentRegistrationMatrix || new THREE.Matrix4();
          const matrix = registrationMatrix.clone().multiply(sourceMatrix);
          const geometry = assessmentLibrary.mesh.geometry.clone();
          const mesh = createAssessmentMesh(geometry, color);
          mesh.applyMatrix4(matrix);
          const id = `${group.id}-body-${bodyIndex + 1}`;
          const entry = {
            id,
            name: scanbody.scanbody_name || `${scan.name} SB${bodyIndex + 1}`,
            type: "assessment-scanbody",
            groupId: group.id,
            datasetGroupId: dataset.id,
            color,
            mesh,
            matrix,
            sourceMatrix,
            scanRegistrationMatrix: scan.assessmentRegistrationMatrix?.clone() || null,
            userVisible: true,
            triangles: geometry.getAttribute("position").count / 3,
            size: geometry.boundingBox.getSize(new THREE.Vector3()),
          };
          addLocalOriginAxes(entry);
          assessmentModels.set(id, entry);
          group.childIds.push(id);
        });
      });
    });
  });
  renderAssessmentObjects();
  updateAssessmentUI();
  if (refitView) fitView();
}

async function importAssessmentLibrary(file) {
  if (!file || !file.name.toLowerCase().endsWith(".stl")) {
    showToast("Choose a valid STL library file.", "error");
    return;
  }
  loading.hidden = false;
  loading.querySelector("p").textContent = "Loading assessment library…";
  try {
    const geometry = await parseSTLFile(file);
    if (assessmentLibrary) {
      disposeAssessmentEntry(assessmentLibrary);
      assessmentModels.delete(assessmentLibrary.id);
    }
    const color = new THREE.Color(TYPE_CONFIG["assessment-library"].color);
    const mesh = createAssessmentMesh(geometry, color, 0.48);
    assessmentLibrary = {
      id: "assessment-library",
      name: file.name,
      type: "assessment-library",
      color,
      mesh,
      userVisible: true,
      triangles: geometry.getAttribute("position").count / 3,
      size: geometry.boundingBox.getSize(new THREE.Vector3()),
    };
    addLocalOriginAxes(assessmentLibrary);
    assessmentModels.set(assessmentLibrary.id, assessmentLibrary);
    assessmentLibraryStatus.textContent = file.name;
    assessmentLibraryStatus.classList.add("loaded");
    rebuildAssessmentScene();
  } catch (error) {
    showToast(`Library import failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
    assessmentLibraryInput.value = "";
  }
}

async function importAssessmentJsonFiles(groupId, fileList) {
  const group = assessmentDataGroups.get(groupId);
  if (!group || !fileList?.length) return;
  if (group.type === "reference") clearAssessmentRegistrations();
  if (group.type === "test") delete group.precisionAssessment;
  const shouldAutoNameGroup = group.type === "test" && !group.nameEdited && group.files.length === 0;
  let autoName = null;
  for (const file of [...fileList]) {
    if (!file.name.toLowerCase().endsWith(".json")) {
      showToast(`${file.name} is not a JSON file.`, "error");
      continue;
    }
    try {
      const data = JSON.parse(await file.text());
      const scans = normalizedAssessmentScans(data);
      scans.forEach((scan) => scan.scanbodies.forEach((scanbody) => {
        assessmentMatrixFromRows(scanbody.matrix_4x4_row_major);
      }));
      if (shouldAutoNameGroup && !autoName) autoName = assessmentGroupNameFromFile(file.name);
      group.files.push({
        id: `${group.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        data,
        scans,
      });
    } catch (error) {
      showToast(`${file.name} could not be imported: ${error.message}`, "error");
    }
  }
  if (autoName) group.name = autoName;
  renderAssessmentDataGroups();
  rebuildAssessmentScene();
}

function updateAssessmentUI() {
  const entries = [...assessmentModels.values()];
  entries.forEach((entry) => {
    entry.mesh.visible = activeModule === "accuracy-assessment" && entry.userVisible;
  });
  const scanbodyEntries = entries.filter((entry) => entry.type === "assessment-scanbody");
  const visible = entries.filter((entry) => entry.mesh.visible);
  document.querySelector("#assessment-group-count").textContent =
    [...assessmentDataGroups.values()].filter((group) => group.type === "test").length;
  document.querySelector("#assessment-scan-count").textContent = assessmentScanGroups.size;
  document.querySelector("#assessment-body-count").textContent = scanbodyEntries.length;
  const referenceScanCount = assessmentScansForDataset("reference").length;
  const testScanCount = [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .reduce((sum, dataset) => sum + assessmentScansForDataset(dataset.id).length, 0);
  const precisionPairCount = availablePrecisionPairCount();
  const measuredPrecisionPairCount = precisionMeasuredPairCount();
  const registeredTestScanCount = [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .reduce((sum, dataset) => (
      sum + assessmentScansForDataset(dataset.id)
        .filter(({ scan }) => scan.assessmentRegistrationMatrix).length
  ), 0);
  const refinedTestScanCount = [...assessmentDataGroups.values()]
    .filter((dataset) => dataset.type === "test")
    .reduce((sum, dataset) => (
      sum + assessmentScansForDataset(dataset.id)
        .filter(({ scan }) => scan.assessmentRegistration?.refined).length
  ), 0);
  initialAssessmentAlignmentButton.disabled = !assessmentLibrary || !referenceScanCount || !testScanCount;
  refinedAssessmentAlignmentButton.disabled = registeredTestScanCount !== testScanCount || !testScanCount;
  assessmentAlignmentReportButton.disabled = !registeredTestScanCount;
  assessmentKabschModeSelect.value = activeAssessmentKabschMode;
  assessmentKabschWeightSelect.value = activeAssessmentKabschWeightMode;
  assessmentKabschWeightSelect.disabled = activeAssessmentKabschMode !== "weighted-origin";
  precisionMeasureButton.disabled = !precisionPairCount;
  precisionReportButton.disabled = !measuredPrecisionPairCount;
  assessmentWorkflowToggle.querySelectorAll("[data-assessment-workflow]").forEach((button) => {
    button.classList.toggle("active", button.dataset.assessmentWorkflow === activeAssessmentWorkflow);
  });
  truenessAssessmentActions.hidden = activeAssessmentWorkflow !== "trueness";
  precisionAssessmentActions.hidden = activeAssessmentWorkflow !== "precision";
  if (activeAssessmentWorkflow === "precision") {
    if (!precisionPairCount) {
      assessmentRegistrationStatus.textContent = "Add at least two compatible test scans in one group";
      assessmentRegistrationStatus.className = "assessment-registration-status";
    } else if (measuredPrecisionPairCount) {
      assessmentRegistrationStatus.textContent =
        `Precision measured for ${measuredPrecisionPairCount} scan pair${measuredPrecisionPairCount === 1 ? "" : "s"}`;
      assessmentRegistrationStatus.className = "assessment-registration-status complete";
    } else {
      assessmentRegistrationStatus.textContent =
        `Ready to measure ${precisionPairCount} within-group scan pair${precisionPairCount === 1 ? "" : "s"}`;
      assessmentRegistrationStatus.className = "assessment-registration-status";
    }
  } else {
    if (!referenceScanCount || !testScanCount) {
      assessmentRegistrationStatus.textContent = "Add a reference scan and at least one test scan";
      assessmentRegistrationStatus.className = "assessment-registration-status";
    } else if (refinedTestScanCount === testScanCount) {
      assessmentRegistrationStatus.textContent =
        `${refinedTestScanCount} test scan${refinedTestScanCount === 1 ? "" : "s"} refined with surface ICP`;
      assessmentRegistrationStatus.className = "assessment-registration-status complete";
    } else if (registeredTestScanCount === testScanCount) {
      assessmentRegistrationStatus.textContent =
        `${registeredTestScanCount} test scan${registeredTestScanCount === 1 ? "" : "s"} Kabsch aligned; ready for ICP`;
      assessmentRegistrationStatus.className = "assessment-registration-status complete";
    } else {
      assessmentRegistrationStatus.textContent =
        `Ready to Kabsch align ${testScanCount} test scan${testScanCount === 1 ? "" : "s"}`;
      assessmentRegistrationStatus.className = "assessment-registration-status";
    }
  }
  clearAssessmentButton.disabled = !assessmentLibrary && !assessmentHasTransformationFiles();
  document.querySelector("#model-count").textContent = `${entries.length} MODEL${entries.length === 1 ? "" : "S"}`;
  document.querySelector("#file-count").textContent = `${assessmentScanGroups.size} / ${scanbodyEntries.length}`;
  document.querySelector("#triangle-count").textContent = entries.length
    ? formatNumber(visible.reduce((sum, entry) => sum + entry.triangles, 0))
    : "—";
  viewerEmpty.hidden = entries.length > 0;
  centerLibraryButton.disabled = !assessmentLibrary;
  showAllObjectsButton.disabled = entries.length === 0 || entries.every((entry) => entry.userVisible);
  hideAllObjectsButton.disabled = entries.length === 0 || entries.every((entry) => !entry.userVisible);
  updateDeviationLegendState();
  if (visible.length) {
    const box = new THREE.Box3();
    visible.forEach((entry) => box.expandByObject(entry.mesh));
    const size = box.getSize(new THREE.Vector3());
    document.querySelector("#scene-size").textContent = `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)}`;
  } else {
    document.querySelector("#scene-size").textContent = "—";
  }
  const referenceSize = assessmentLibrary
    ? Math.max(assessmentLibrary.size.x, assessmentLibrary.size.y, assessmentLibrary.size.z, 10)
    : 10;
  grid.scale.setScalar((referenceSize * 3) / 200);
}

function switchModule(moduleName) {
  activeModule = moduleName;
  hideObjectHoverLabel();
  document.querySelectorAll(".module-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.module === moduleName);
  });
  document.querySelector("#data-processing-sidebar").hidden = moduleName !== "data-processing";
  document.querySelector("#accuracy-assessment-sidebar").hidden = moduleName !== "accuracy-assessment";
  document.querySelector("#report-sidebar").hidden = moduleName !== "report";
  dataObjectsList.hidden = moduleName !== "data-processing";
  assessmentObjectsList.hidden = moduleName !== "accuracy-assessment";
  document.querySelectorAll(".data-processing-control").forEach((control) => {
    control.hidden = moduleName !== "data-processing";
  });
  document.querySelector(".assessment-toolbar-action").hidden = moduleName !== "accuracy-assessment";
  viewportToolbar.hidden = moduleName === "report";
  viewer.hidden = moduleName === "report";
  reportPanel.hidden = moduleName !== "report";
  viewportPanel.classList.toggle("report-mode", moduleName === "report");
  viewportPanel.classList.toggle("assessment-mode", moduleName === "accuracy-assessment");
  statsBar.hidden = moduleName === "report";
  deviationLegend.hidden = true;
  modelsGroup.visible = moduleName === "data-processing";
  assessmentGroup.visible = moduleName === "accuracy-assessment";
  document.querySelector("#file-count-label").textContent = moduleName === "data-processing"
    ? "LIBRARY / FULL-ARCH"
    : moduleName === "accuracy-assessment" ? "SCANS / SCANBODIES" : "REPORT";
  [...models.values()].forEach((entry) => {
    if (moduleName === "data-processing") entry.mesh.visible = entry.userVisible ?? entry.mesh.visible;
  });
  if (moduleName === "data-processing") {
    updateUI();
    updateSceneReference();
  } else if (moduleName === "accuracy-assessment") {
    renderAssessmentObjects();
    updateAssessmentUI();
  } else {
    renderReportModule();
  }
  if (moduleName !== "report") fitView();
}

function wireDropZone(zone, input, type) {
  zone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => uploadFiles(input.files, type));
  ["dragenter", "dragover"].forEach((eventType) => zone.addEventListener(eventType, (event) => {
    event.preventDefault();
    zone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((eventType) => zone.addEventListener(eventType, (event) => {
    event.preventDefault();
    zone.classList.remove("dragging");
  }));
  zone.addEventListener("drop", (event) => uploadFiles(event.dataTransfer.files, type));
}

wireDropZone(libraryDropZone, libraryInput, "library");
wireDropZone(scansDropZone, scansInput, "scan");
document.querySelectorAll(".module-tab").forEach((button) => {
  button.addEventListener("click", () => switchModule(button.dataset.module));
});
assessmentLibraryZone.addEventListener("click", () => assessmentLibraryInput.click());
referenceJsonZone.addEventListener("click", () => referenceJsonInput.click());
referenceGroupColor.addEventListener("input", () => {
  setAssessmentDataGroupColor("reference", referenceGroupColor.value);
});
assessmentLibraryInput.addEventListener("change", () => importAssessmentLibrary(assessmentLibraryInput.files[0]));
referenceJsonInput.addEventListener("change", async () => {
  await importAssessmentJsonFiles("reference", referenceJsonInput.files);
  referenceJsonInput.value = "";
});
addTestGroupButton.addEventListener("click", createAssessmentTestGroup);
assessmentWorkflowToggle.querySelectorAll("[data-assessment-workflow]").forEach((button) => {
  button.addEventListener("click", () => setAssessmentWorkflow(button.dataset.assessmentWorkflow));
});
assessmentKabschModeSelect.addEventListener("change", (event) => {
  activeAssessmentKabschMode = event.currentTarget.value === "weighted-origin" ? "weighted-origin" : "origin";
  updateAssessmentUI();
});
assessmentKabschWeightSelect.addEventListener("change", (event) => {
  activeAssessmentKabschWeightMode = ["invVar", "inv", "uniform"].includes(event.currentTarget.value)
    ? event.currentTarget.value
    : "invVar";
  updateAssessmentUI();
});
initialAssessmentAlignmentButton.addEventListener("click", runAssessmentInitialAlignment);
refinedAssessmentAlignmentButton.addEventListener("click", runAssessmentRefinedAlignment);
precisionMeasureButton.addEventListener("click", runAssessmentPrecisionMeasure);
precisionReportButton.addEventListener("click", openAssessmentPrecisionReport);
reportModeToggle.querySelectorAll("[data-report-mode]").forEach((button) => {
  button.addEventListener("click", () => setReportMode(button.dataset.reportMode));
});
[
  [assessmentLibraryZone, assessmentLibraryInput, importAssessmentLibrary],
].forEach(([zone, input, handler]) => {
  ["dragenter", "dragover"].forEach((eventType) => zone.addEventListener(eventType, (event) => {
    event.preventDefault();
    zone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((eventType) => zone.addEventListener(eventType, (event) => {
    event.preventDefault();
    zone.classList.remove("dragging");
  }));
  zone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (file) handler(file);
    input.value = "";
  });
});
["dragenter", "dragover"].forEach((eventType) => referenceJsonZone.addEventListener(eventType, (event) => {
  event.preventDefault();
  referenceJsonZone.classList.add("dragging");
}));
["dragleave", "drop"].forEach((eventType) => referenceJsonZone.addEventListener(eventType, (event) => {
  event.preventDefault();
  referenceJsonZone.classList.remove("dragging");
}));
referenceJsonZone.addEventListener("drop", async (event) => {
  await importAssessmentJsonFiles("reference", event.dataTransfer.files);
  referenceJsonInput.value = "";
});
clearAssessmentButton.addEventListener("click", () => clearAssessment());

clearScansButton.addEventListener("click", () => {
  [...models.values()]
    .filter((entry) => entry.type === "scan" || entry.type === "registered")
    .forEach((entry) => removeModel(entry.id, false));
  deleteDataProcessingImportSnapshotsByType("scan");
  updateSceneReference();
  updateUI();
  if (models.size) fitView();
});
resetDataProcessingButton.addEventListener("click", resetDataProcessingOperations);
document.querySelector("#fit-view").addEventListener("click", fitView);
centerLibraryButton.addEventListener("click", centerLibraryView);
document.querySelector("#reset-view").addEventListener("click", () => {
  camera.position.set(120, 150, 95);
  controls.target.set(0, 0, 0);
  controls.update();
});
wireframeToggle.addEventListener("change", () => {
  models.forEach((entry) => { entry.mesh.material.wireframe = wireframeToggle.checked; });
  assessmentModels.forEach((entry) => { entry.mesh.material.wireframe = wireframeToggle.checked; });
});
canvas.addEventListener("pointermove", updateObjectHoverLabel);
canvas.addEventListener("pointerleave", hideObjectHoverLabel);
canvas.addEventListener("pointerdown", (event) => {
  centerViewOnMiddleClick(event);
  hideObjectHoverLabel();
});
gridToggle.addEventListener("change", () => { grid.visible = gridToggle.checked; });
deviationColorMapToggle.addEventListener("change", () => {
  deviationColorMapVisible = deviationColorMapToggle.checked;
  applyDeviationColorMapVisibility();
});
featureSeedArrowsToggle.addEventListener("change", () => {
  featureSeedArrowsVisible = featureSeedArrowsToggle.checked;
  applyFeatureSeedArrowVisibility();
});
dataLibraryColorInput.addEventListener("input", (event) => {
  setDataProcessingTypeColor("library", event.currentTarget.value);
});
dataScansColorInput.addEventListener("input", (event) => {
  setDataProcessingTypeColor("scan", event.currentTarget.value);
});
isolateScanbodiesButton.addEventListener("click", isolateScanbodies);
libraryTypeToggle.addEventListener("click", () => {
  setLibraryTypePanelOpen(libraryTypePanel.hidden);
});
libraryTypeSelect.addEventListener("change", (event) => {
  setScanbodyLibraryType(event.currentTarget.value);
});
document.addEventListener("click", (event) => {
  if (libraryTypePanel.hidden) return;
  if (libraryTypeWorkflow.contains(event.target)) return;
  setLibraryTypePanelOpen(false);
});
featureDetectButton.addEventListener("click", detectFeatures);
cropScanbodiesButton.addEventListener("click", cropScanbodies);
registerScanbodiesButton.addEventListener("click", registerIsolatedScanbodies);
refineRegistrationButton.addEventListener("click", refineInitialRegistrations);
planeRefinementButton.addEventListener("click", refineRegistrationPlanes);
deviationScaleRange.addEventListener("input", (event) => setDeviationScale(event.currentTarget.value));
deviationScaleNumber.addEventListener("change", (event) => setDeviationScale(event.currentTarget.value));
registrationMatricesButton.addEventListener("click", openRegistrationMatrices);
document.querySelector("#export-registration-matrices").addEventListener("click", exportRegistrationMatrices);
document.querySelector("#close-registration-matrices").addEventListener("click", closeRegistrationMatrices);
registrationMatrixWindow.addEventListener("click", (event) => {
  if (event.target === registrationMatrixWindow) closeRegistrationMatrices();
});
assessmentAlignmentReportButton.addEventListener("click", openAssessmentAlignmentReport);
document.querySelector("#close-assessment-alignment-report").addEventListener("click", closeAssessmentAlignmentReport);
assessmentAlignmentWindow.addEventListener("click", (event) => {
  if (event.target === assessmentAlignmentWindow) closeAssessmentAlignmentReport();
});
document.querySelector("#objects-collapse").addEventListener("click", (event) => {
  const collapsed = objectsPanel.classList.toggle("collapsed");
  event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
  event.currentTarget.title = collapsed ? "Expand object list" : "Collapse object list";
});
showAllObjectsButton.addEventListener("click", () => {
  if (activeModule === "accuracy-assessment") {
    assessmentModels.forEach((entry) => {
      entry.userVisible = true;
      entry.mesh.visible = true;
    });
    renderAssessmentObjects();
    updateAssessmentUI();
  } else {
    models.forEach((entry) => setModelVisibility(entry, true));
  }
});
hideAllObjectsButton.addEventListener("click", () => {
  if (activeModule === "accuracy-assessment") {
    assessmentModels.forEach((entry) => {
      entry.userVisible = false;
      entry.mesh.visible = false;
    });
    renderAssessmentObjects();
    updateAssessmentUI();
  } else {
    models.forEach((entry) => setModelVisibility(entry, false));
  }
});

new ResizeObserver(resizeRenderer).observe(viewer);
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f") fitView();
  if (event.key === "Escape" && !registrationMatrixWindow.hidden) closeRegistrationMatrices();
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resizeRenderer();
syncDataProcessingColorInputs();
initializeAssessmentDataGroups();
renderAssessmentDataGroups();
updateUI();
updateSceneReference();
renderAssessmentObjects();
animate();
