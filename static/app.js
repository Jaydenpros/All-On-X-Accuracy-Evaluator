import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

const canvas = document.querySelector("#scene-canvas");
const viewer = document.querySelector("#viewer");
const libraryInput = document.querySelector("#library-input");
const scansInput = document.querySelector("#scans-input");
const libraryDropZone = document.querySelector("#library-drop-zone");
const scansDropZone = document.querySelector("#scans-drop-zone");
const libraryList = document.querySelector("#library-list");
const scansList = document.querySelector("#scans-list");
const libraryEmpty = document.querySelector("#library-empty");
const scansEmpty = document.querySelector("#scans-empty");
const viewerEmpty = document.querySelector("#viewer-empty");
const loading = document.querySelector("#loading");
const clearScansButton = document.querySelector("#clear-scans");
const wireframeToggle = document.querySelector("#wireframe-toggle");
const gridToggle = document.querySelector("#grid-toggle");
const objectsPanel = document.querySelector("#objects-panel");
const objectsList = document.querySelector("#objects-list");
const dataObjectsList = document.querySelector("#data-objects-list");
const assessmentObjectsList = document.querySelector("#assessment-objects-list");
const assessmentObjectsEmpty = document.querySelector("#assessment-objects-empty");
const objectsEmpty = document.querySelector("#objects-empty");
const showAllObjectsButton = document.querySelector("#show-all-objects");
const hideAllObjectsButton = document.querySelector("#hide-all-objects");
const isolateScanbodiesButton = document.querySelector("#isolate-scanbodies");
const registerScanbodiesButton = document.querySelector("#register-scanbodies");
const refineRegistrationButton = document.querySelector("#refine-registration");
const planeRefinementButton = document.querySelector("#plane-refinement");
const centerLibraryButton = document.querySelector("#center-library");
const deviationLegend = document.querySelector("#deviation-legend");
const deviationScaleRange = document.querySelector("#deviation-scale-range");
const deviationScaleNumber = document.querySelector("#deviation-scale-number");
const registrationMatricesButton = document.querySelector("#show-registration-matrices");
const registrationMatrixWindow = document.querySelector("#registration-matrix-window");
const registrationMatrixList = document.querySelector("#registration-matrix-list");
const registrationExportFilename = document.querySelector("#registration-export-filename");
const assessmentLibraryInput = document.querySelector("#assessment-library-input");
const assessmentLibraryZone = document.querySelector("#assessment-library-zone");
const assessmentLibraryStatus = document.querySelector("#assessment-library-status");
const referenceJsonInput = document.querySelector("#reference-json-input");
const referenceJsonZone = document.querySelector("#reference-json-zone");
const referenceFileList = document.querySelector("#reference-file-list");
const testGroupsContainer = document.querySelector("#test-groups-container");
const addTestGroupButton = document.querySelector("#add-test-group");
const clearAssessmentButton = document.querySelector("#clear-assessment");
let activeModule = "data-processing";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x171918, 0.0014);

const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000000);
camera.up.set(0, 0, 1);
camera.position.set(120, 150, 95);

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

const axes = new THREE.AxesHelper(50);
axes.renderOrder = 3;
scene.add(axes);

const originMarker = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
);
originMarker.renderOrder = 4;
scene.add(originMarker);

const modelsGroup = new THREE.Group();
scene.add(modelsGroup);
const assessmentGroup = new THREE.Group();
assessmentGroup.visible = false;
scene.add(assessmentGroup);

const loader = new STLLoader();
const models = new Map();
const scanGroups = new Map();
const assessmentModels = new Map();
const assessmentScanGroups = new Map();
const assessmentDataGroups = new Map();
let assessmentLibrary = null;
let nextAssessmentTestGroup = 1;
let deviationScaleMaximum = 0.5;
const TYPE_CONFIG = {
  library: { color: 0x4f8fff, label: "LIBRARY" },
  scan: { color: 0x42d890, label: "FULL-ARCH SCAN" },
  registered: { color: 0x8eb8ff, label: "REGISTERED LIBRARY" },
  "assessment-library": { color: 0xc488ff, label: "ASSESSMENT LIBRARY" },
  "assessment-scanbody": { color: 0x56d8ff, label: "RECONSTRUCTED SCANBODY" },
};

function resizeRenderer() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
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
  const completedRegistrations = registeredEntries.filter((entry) => (
    entry.registrationStage === "final" || entry.registrationStage === "plane-refined"
  ));
  const pendingPlaneRefinements = registeredEntries.filter((entry) => (
    entry.registrationStage === "final" && !entry.planeRefinementCompleted
  ));
  const triangleTotal = visible.reduce((sum, entry) => sum + entry.triangles, 0);

  libraryEmpty.hidden = libraryEntries.length > 0;
  scansEmpty.hidden = scanEntries.length > 0;
  objectsEmpty.hidden = entries.length > 0;
  viewerEmpty.hidden = entries.length > 0;
  clearScansButton.disabled = scanEntries.length === 0;
  isolateScanbodiesButton.disabled = !scanEntries.some((entry) => !entry.isolated);
  centerLibraryButton.disabled = libraryEntries.length === 0;
  registerScanbodiesButton.disabled = libraryEntries.length === 0
    || !scanEntries.some((entry) => entry.isolated && !entry.registered);
  refineRegistrationButton.disabled = initialRegistrations.length === 0;
  planeRefinementButton.disabled = pendingPlaneRefinements.length === 0;
  registrationMatricesButton.disabled = completedRegistrations.length === 0;
  deviationLegend.hidden = registeredEntries.length === 0;
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
  axes.scale.setScalar((Math.max(referenceSize, 10) / 50) * 20);
  originMarker.scale.setScalar(Math.max(referenceSize, 10) / 100);
  axes.visible = Boolean(library);
  originMarker.visible = Boolean(library);
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
      <span class="model-meta">${TYPE_CONFIG[entry.type].label} · ${formatBytes(entry.bytes)} · ${formatNumber(entry.triangles)} TRI</span>
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
  const wrapper = document.createElement("section");
  wrapper.className = "object-group";
  wrapper.dataset.groupId = id;
  wrapper.innerHTML = `
    <div class="object-group-row">
      <button class="group-toggle" type="button" title="Collapse ${safeName}" aria-expanded="true">
        <svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>
      </button>
      <span class="object-swatch" style="color:#42d890;background:#42d890"></span>
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

function removeModel(id, refit = true) {
  const entry = models.get(id);
  if (!entry) return;
  modelsGroup.remove(entry.mesh);
  entry.mesh.geometry.dispose();
  entry.mesh.material.dispose();
  entry.row?.remove();
  entry.objectRow?.remove();
  models.delete(id);
  if (entry.type === "registered" && entry.registrationFor) {
    const scanbody = models.get(entry.registrationFor);
    if (scanbody) {
      scanbody.registered = false;
      delete scanbody.deviationDistances;
      scanbody.mesh.geometry.deleteAttribute("color");
      scanbody.mesh.material.vertexColors = false;
      scanbody.mesh.material.color.set(TYPE_CONFIG.scan.color);
      scanbody.mesh.material.needsUpdate = true;
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
  updateSceneReference();
  updateUI();
  if (refit && models.size) fitView();
}

function addModelFromGeometry({ geometry, id, name, bytes, type, isolated = false, groupId = null }) {
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
    mesh,
    row: null,
    objectRow: null,
    userVisible: true,
  };

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
  return addModelFromGeometry({
    geometry,
    id: fileRecord.id,
    name: fileRecord.name,
    bytes: fileRecord.size,
    type,
  });
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

function principalAxis(points) {
  const center = pointCentroid(points);
  let xx = 0; let xy = 0; let xz = 0;
  let yy = 0; let yz = 0; let zz = 0;
  points.forEach((point) => {
    const x = point.x - center.x;
    const y = point.y - center.y;
    const z = point.z - center.z;
    xx += x * x; xy += x * y; xz += x * z;
    yy += y * y; yz += y * z; zz += z * z;
  });
  let axis = new THREE.Vector3(1, 1, 1).normalize();
  for (let iteration = 0; iteration < 20; iteration += 1) {
    axis = new THREE.Vector3(
      xx * axis.x + xy * axis.y + xz * axis.z,
      xy * axis.x + yy * axis.y + yz * axis.z,
      xz * axis.x + yz * axis.y + zz * axis.z,
    ).normalize();
  }
  return axis;
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

function initialRegistrationMatrices(sourcePoints, targetPoints) {
  const sourceCenter = pointCentroid(sourcePoints);
  const targetCenter = pointCentroid(targetPoints);
  const sourceAxis = principalAxis(sourcePoints);
  const targetAxis = principalAxis(targetPoints);
  const matrices = [];

  [1, -1].forEach((direction) => {
    const directedTargetAxis = targetAxis.clone().multiplyScalar(direction);
    const align = new THREE.Quaternion().setFromUnitVectors(sourceAxis, directedTargetAxis);
    for (let turn = 0; turn < 4; turn += 1) {
      const spin = new THREE.Quaternion().setFromAxisAngle(directedTargetAxis, turn * Math.PI / 2);
      const rotation = spin.multiply(align).normalize();
      const translation = targetCenter.clone().sub(sourceCenter.clone().applyQuaternion(rotation));
      matrices.push(new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1)));
    }
  });
  return matrices;
}

function detectPlanarPatches(geometry, maximumPatches = 5) {
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
      normal: cross.normalize(),
      center: a.add(b).add(c).multiplyScalar(1 / 3),
      area,
    });
  }
  if (!triangles.length) return [];

  const seedIndices = new Set();
  const stride = Math.max(1, Math.floor(triangles.length / 120));
  for (let index = 0; index < triangles.length; index += stride) seedIndices.add(index);
  [...triangles]
    .map((triangle, index) => ({ index, area: triangle.area }))
    .sort((first, second) => second.area - first.area)
    .slice(0, 50)
    .forEach(({ index }) => seedIndices.add(index));

  const cosineTolerance = Math.cos(THREE.MathUtils.degToRad(14));
  const distanceTolerance = 0.3;
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

function dominantPerpendicularPair(patches) {
  let best = null;
  for (let first = 0; first < patches.length; first += 1) {
    for (let second = first + 1; second < patches.length; second += 1) {
      const perpendicularity = Math.abs(patches[first].normal.dot(patches[second].normal));
      if (perpendicularity > 0.42) continue;
      const score = patches[first].area + patches[second].area;
      if (!best || score > best.score) best = { first: patches[first], second: patches[second], score };
    }
  }
  return best;
}

function frameFromPlaneNormals(firstNormal, secondNormal) {
  const x = firstNormal.clone().normalize();
  const z = secondNormal.clone().addScaledVector(x, -secondNormal.dot(x)).normalize();
  const y = z.clone().cross(x).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

function planeAlignedInitialMatrices(sourceGeometry, targetGeometry, sourcePoints, targetPoints) {
  const sourcePair = dominantPerpendicularPair(detectPlanarPatches(sourceGeometry));
  const targetPatches = detectPlanarPatches(targetGeometry);
  if (!sourcePair || targetPatches.length < 2) return [];

  const sourceCenter = pointCentroid(sourcePoints);
  const targetCenter = pointCentroid(targetPoints);
  const targetPairs = [];
  for (let first = 0; first < targetPatches.length; first += 1) {
    for (let second = first + 1; second < targetPatches.length; second += 1) {
      if (Math.abs(targetPatches[first].normal.dot(targetPatches[second].normal)) < 0.42) {
        targetPairs.push({ first: targetPatches[first], second: targetPatches[second] });
      }
    }
  }
  targetPairs.sort((a, b) => (b.first.area + b.second.area) - (a.first.area + a.second.area));

  const matrices = [];
  targetPairs.slice(0, 3).forEach((targetPair) => {
    [
      [targetPair.first, targetPair.second],
      [targetPair.second, targetPair.first],
    ].forEach(([targetFirst, targetSecond]) => {
      [-1, 1].forEach((firstSign) => {
        [-1, 1].forEach((secondSign) => {
          const sourceFrame = frameFromPlaneNormals(sourcePair.first.normal, sourcePair.second.normal);
          const targetFrame = frameFromPlaneNormals(
            targetFirst.normal.clone().multiplyScalar(firstSign),
            targetSecond.normal.clone().multiplyScalar(secondSign),
          );
          const rotationMatrix = targetFrame.clone().multiply(sourceFrame.clone().invert());
          const rotation = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
          const targetX = new THREE.Vector3().setFromMatrixColumn(targetFrame, 0);
          const targetY = new THREE.Vector3().setFromMatrixColumn(targetFrame, 1);
          const targetZ = new THREE.Vector3().setFromMatrixColumn(targetFrame, 2);
          const firstDelta = targetFirst.center.clone()
            .sub(sourcePair.first.center.clone().applyQuaternion(rotation));
          const secondDelta = targetSecond.center.clone()
            .sub(sourcePair.second.center.clone().applyQuaternion(rotation));
          const centerDelta = targetCenter.clone().sub(sourceCenter.clone().applyQuaternion(rotation));
          const translation = targetX.clone().multiplyScalar(firstDelta.dot(targetX))
            .addScaledVector(targetZ, secondDelta.dot(targetZ))
            .addScaledVector(targetY, centerDelta.dot(targetY));
          matrices.push(new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1)));
        });
      });
    });
  });
  return matrices;
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

function prepareRegistration(libraryGeometry, scanGeometry) {
  const sourcePoints = sampleGeometryPoints(libraryGeometry, 750);
  const targetPoints = sampleGeometryPoints(scanGeometry, 1100);
  const planeInitials = planeAlignedInitialMatrices(
    libraryGeometry,
    scanGeometry,
    sourcePoints,
    targetPoints,
  );
  const fallbackInitials = initialRegistrationMatrices(sourcePoints, targetPoints);
  const candidates = [...planeInitials, ...fallbackInitials];
  let preview = null;
  candidates.forEach((matrix) => {
    const error = scoreInitialRegistration(sourcePoints, targetPoints, matrix);
    if (!preview || error < preview.error) preview = { matrix: matrix.clone(), error };
  });
  return {
    sourcePoints,
    targetPoints,
    candidates,
    preview,
    initialization: planeInitials.length ? "two-plane + principal-axis candidates" : "principal-axis candidates",
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

function colorizeDeviationEntry(scanEntry, maximum = deviationScaleMaximum) {
  if (!scanEntry.deviationDistances) return;
  const position = scanEntry.mesh.geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  scanEntry.deviationDistances.forEach((distance, index) => {
    const color = deviationColor(Math.min(distance / maximum, 1));
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
            <span class="matrix-entry-error">RMS ${Number(entry.registrationError || 0).toFixed(4)} mm</span>
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
    groups.get(groupId).scanbodies.push({
      scanbody_name: entry.registrationTargetName || entry.name,
      library_name: entry.registrationSourceName || "Library",
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
      rms_error_mm: Number(entry.registrationError || 0),
    });
  });

  const fullArchScans = [...groups.values()]
    .sort((first, second) => first.full_arch_scan_name.localeCompare(second.full_arch_scan_name));
  fullArchScans.forEach((fullArchScan) => {
    fullArchScan.scanbodies.sort((first, second) => first.scanbody_name.localeCompare(second.scanbody_name, undefined, { numeric: true }));
  });

  return {
    format: "FormSpace Registration Matrices",
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
  const baseName = enteredName || `FormSpace_Registration_Matrices_${timestamp}.json`;
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
    registrationExportFilename.value = "FormSpace_Registration_Matrices.json";
  }
  registrationMatrixWindow.hidden = false;
  document.body.classList.add("modal-open");
}

function closeRegistrationMatrices() {
  registrationMatrixWindow.hidden = true;
  document.body.classList.remove("modal-open");
}

function applyDeviationMap(scanEntry, libraryGeometry, registrationMatrix) {
  const registeredPoints = sampleGeometryPoints(libraryGeometry, 5000)
    .map((point) => point.applyMatrix4(registrationMatrix));
  const tree = buildKdTree(registeredPoints);
  const position = scanEntry.mesh.geometry.getAttribute("position");
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

async function isolateScanbodies() {
  const sourceScans = [...models.values()].filter((entry) => entry.type === "scan" && !entry.isolated);
  if (!sourceScans.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Isolating scanbodies…";
  await new Promise((resolve) => setTimeout(resolve, 20));

  try {
    let isolatedTotal = 0;
    sourceScans.forEach((source) => {
      const connectedComponents = isolateGeometry(source.mesh.geometry);
      const components = groupNearbyComponents(connectedComponents, 5);
      const groupId = `group-${source.id}`;
      const sourceVisible = source.mesh.visible;
      const sourceName = source.name;
      removeModel(source.id, false);
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
    updateUI();
    fitView();
    showToast(`Created ${isolatedTotal} isolated scanbody object${isolatedTotal === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error("Could not isolate scanbodies:", error);
    showToast(`Scanbody isolation failed: ${error.message}`, "error");
  } finally {
    loading.hidden = true;
    loading.querySelector("p").textContent = "Processing geometry…";
  }
}

async function registerIsolatedScanbodies() {
  const library = [...models.values()].find((entry) => entry.type === "library");
  const scanbodies = [...models.values()].filter((entry) => entry.type === "scan" && entry.isolated && !entry.registered);
  if (!library || !scanbodies.length) return;

  loading.hidden = false;
  loading.querySelector("p").textContent = "Preparing initial alignments…";
  await new Promise((resolve) => setTimeout(resolve, 30));

  try {
    for (let index = 0; index < scanbodies.length; index += 1) {
      const scanbody = scanbodies[index];
      loading.querySelector("p").textContent = `Initial alignment ${index + 1} of ${scanbodies.length}…`;
      await new Promise((resolve) => setTimeout(resolve, 10));
      const preparation = prepareRegistration(library.mesh.geometry, scanbody.mesh.geometry);
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
      registeredCopy.mesh.material.transparent = true;
      registeredCopy.mesh.material.opacity = 0.38;
      registeredCopy.mesh.material.depthWrite = false;
      registeredCopy.registrationStage = "initial";
      registeredCopy.initialAlignmentError = preparation.preview.error;
      registeredCopy.registrationPreparation = preparation;
      registeredCopy.registrationFor = scanbody.id;
      registeredCopy.registrationTargetName = scanbody.name;
      registeredCopy.registrationSourceName = library.name;
      const initialTypeLabel = registeredCopy.objectRow?.querySelector(".object-type");
      if (initialTypeLabel) initialTypeLabel.textContent = "INITIAL ALIGNMENT · REVIEW BEFORE ICP";
      scanbody.registered = true;
      applyDeviationMap(scanbody, library.mesh.geometry, preparation.preview.matrix);
      updateGroupState(scanbody.groupId);
    }
    setDeviationScale(0.5);
    updateUI();
    showToast(`Initial alignment prepared for ${scanbodies.length} scanbod${scanbodies.length === 1 ? "y" : "ies"}. Review the result, then run Step 2.`);
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
    }
    setDeviationScale(0.5);
    updateUI();
    showToast(
      `Plane refinement completed: ${refinedCount} refined, ${partialCount} partially refined, ${unchangedCount} unchanged.`,
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
          delete entry.deviationDistances;
          entry.mesh.geometry.deleteAttribute("color");
          entry.mesh.material.vertexColors = false;
          entry.mesh.material.color.set(TYPE_CONFIG.scan.color);
          entry.mesh.material.needsUpdate = true;
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

function initializeAssessmentDataGroups() {
  assessmentDataGroups.clear();
  assessmentDataGroups.set("reference", {
    id: "reference",
    type: "reference",
    name: "Reference group",
    files: [],
    collapsed: false,
  });
  assessmentDataGroups.set("test-group-1", {
    id: "test-group-1",
    type: "test",
    name: "Group 1",
    files: [],
    collapsed: false,
  });
  nextAssessmentTestGroup = 2;
}

function createAssessmentTestGroup() {
  const number = nextAssessmentTestGroup++;
  const group = {
    id: `test-group-${number}`,
    type: "test",
    name: `Group ${number}`,
    files: [],
    collapsed: false,
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
      input.value = group.name;
      renderAssessmentObjects();
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
      group.files = group.files.filter((fileRecord) => fileRecord.id !== button.dataset.removeAssessmentFile);
      rebuildAssessmentScene();
      renderAssessmentDataGroups();
    });
  });
}

function renderAssessmentDataGroups() {
  const reference = assessmentDataGroups.get("reference");
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
        <button class="remove-test-group" type="button" data-remove-test-group="${group.id}" aria-label="Remove ${escapeHTML(group.name)}">×</button>
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
  entry.mesh.geometry.dispose();
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
          <span class="object-copy"><span class="object-name">${escapeHTML(group.name)}</span><span class="object-type">${children.length} SCANBODIES · RECONSTRUCTED</span></span>
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
          <span class="dataset-badge ${dataset.type}">${dataset.type === "reference" ? "R" : "T"}</span>
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

function rebuildAssessmentScene() {
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

  const palette = [0x56d8ff, 0xffb35c, 0x70e39f, 0xff72a8, 0xb897ff, 0xffe066, 0x56a8ff];
  let colorIndex = 0;
  [...assessmentDataGroups.values()].forEach((dataset) => {
    dataset.files.forEach((fileRecord, fileIndex) => {
      fileRecord.scans.forEach((scan, scanIndex) => {
        const color = new THREE.Color(dataset.type === "reference"
          ? [0x55cfff, 0x729bff, 0x65e0cf][colorIndex % 3]
          : palette[colorIndex % palette.length]);
        colorIndex += 1;
        const groupId = `${dataset.id}-file-${fileIndex + 1}-scan-${scanIndex + 1}`;
        const group = {
          id: groupId,
          name: scan.name,
          sourceFileName: fileRecord.name,
          datasetGroupId: dataset.id,
          color,
          childIds: [],
          collapsed: false,
        };
        assessmentScanGroups.set(group.id, group);
        scan.scanbodies.forEach((scanbody, bodyIndex) => {
          const matrix = assessmentMatrixFromRows(scanbody.matrix_4x4_row_major);
          const geometry = assessmentLibrary.mesh.geometry.clone();
          const mesh = createAssessmentMesh(geometry, color);
          mesh.applyMatrix4(matrix);
          const id = `${group.id}-body-${bodyIndex + 1}`;
          assessmentModels.set(id, {
            id,
            name: scanbody.scanbody_name || `${scan.name} SB${bodyIndex + 1}`,
            type: "assessment-scanbody",
            groupId: group.id,
            datasetGroupId: dataset.id,
            color,
            mesh,
            matrix,
            userVisible: true,
            triangles: geometry.getAttribute("position").count / 3,
            size: geometry.boundingBox.getSize(new THREE.Vector3()),
          });
          group.childIds.push(id);
        });
      });
    });
  });
  renderAssessmentObjects();
  updateAssessmentUI();
  fitView();
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
  axes.scale.setScalar((referenceSize / 50) * 20);
  axes.visible = Boolean(assessmentLibrary);
  originMarker.visible = Boolean(assessmentLibrary);
}

function switchModule(moduleName) {
  activeModule = moduleName;
  document.querySelectorAll(".module-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.module === moduleName);
  });
  document.querySelector("#data-processing-sidebar").hidden = moduleName !== "data-processing";
  document.querySelector("#accuracy-assessment-sidebar").hidden = moduleName !== "accuracy-assessment";
  dataObjectsList.hidden = moduleName !== "data-processing";
  assessmentObjectsList.hidden = moduleName !== "accuracy-assessment";
  document.querySelectorAll(".data-processing-control").forEach((control) => {
    control.hidden = moduleName !== "data-processing";
  });
  deviationLegend.hidden = true;
  modelsGroup.visible = moduleName === "data-processing";
  assessmentGroup.visible = moduleName === "accuracy-assessment";
  document.querySelector("#file-count-label").textContent = moduleName === "data-processing"
    ? "LIBRARY / FULL-ARCH"
    : "SCANS / SCANBODIES";
  [...models.values()].forEach((entry) => {
    if (moduleName === "data-processing") entry.mesh.visible = entry.userVisible ?? entry.mesh.visible;
  });
  if (moduleName === "data-processing") {
    updateUI();
    updateSceneReference();
  } else {
    renderAssessmentObjects();
    updateAssessmentUI();
  }
  fitView();
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
assessmentLibraryInput.addEventListener("change", () => importAssessmentLibrary(assessmentLibraryInput.files[0]));
referenceJsonInput.addEventListener("change", async () => {
  await importAssessmentJsonFiles("reference", referenceJsonInput.files);
  referenceJsonInput.value = "";
});
addTestGroupButton.addEventListener("click", createAssessmentTestGroup);
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
  updateSceneReference();
  updateUI();
  if (models.size) fitView();
});
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
gridToggle.addEventListener("change", () => { grid.visible = gridToggle.checked; });
isolateScanbodiesButton.addEventListener("click", isolateScanbodies);
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
initializeAssessmentDataGroups();
renderAssessmentDataGroups();
updateUI();
updateSceneReference();
renderAssessmentObjects();
animate();
