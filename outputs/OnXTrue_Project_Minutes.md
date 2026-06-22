# OnXTrue STL Viewer — Project Minutes

**Date:** June 18, 2026
**Current preview:** `http://127.0.0.1:5001/`
**Technology:** Python Flask, HTML/CSS/JavaScript, Three.js

## 1. Project objective

Build a browser-based application that loads dental STL files, displays them in
an interactive 3D scene, separates combined scanbody meshes from full-arch scans, registers a scan
body library against isolated scanbodies, and visualizes surface deviation.

## 2. Completed work

### Application foundation

- Created a Flask backend for uploading, validating, storing, and serving STL
  files.
- Added support for ASCII and binary STL files.
- Added a custom binary STL parser for vendor-specific files such as 3Shape STL
  exports.
- Added a responsive Three.js 3D viewer with orbit, zoom, pan, fit, reset,
  wireframe, and grid controls.

### Upload structure

- Added **Scan Body Library**:
  - Accepts one STL file.
  - Replaces the previous library when a new file is uploaded.
  - Renders in blue.
- Added **Full-arch scans**:
  - Accepts multiple STL files.
  - Renders full-arch scan models in green.

### Coordinate system

- Models retain their native STL coordinates.
- The Scan Body Library origin is used as the scene origin.
- The viewer uses a Z-up coordinate convention.
- Z is vertical; X and Y are horizontal.
- The grid lies on the XY plane at `Z = 0`.
- The visible X, Y, and Z axes were enlarged.
- Added **Center Library** to frame the library without moving any geometry.

### Object organization and visibility

- Added a 3D Objects panel.
- Added individual show/hide switches.
- Added Show All and Hide All.
- Added collapsible parent groups for isolated scanbodies.
- Each original scan becomes a parent group after isolation.
- Parent groups can:
  - Show or hide all children.
  - Expand or collapse the child list.
  - Display a mixed state when only some children are visible.
- Individual scanbody visibility remains independently controllable.

### Scanbody isolation

- Added **Isolate Scanbodies** for full-arch scans.
- Connected triangles are separated into mesh components.
- Components with surfaces within 5 mm are merged into one scanbody.
- Isolated objects are named:
  - `Original Name SB1.stl`
  - `Original Name SB2.stl`
  - etc.
- The sample `Test scan.stl` contains seven disconnected mesh components; two
  nearby components merge, resulting in six isolated scanbodies.

### Registration and deviation mapping

- Added **Registration** after scanbody isolation.
- A copy of the library is created for each isolated scanbody.
- Registration is rigid: translation and rotation only, with no scaling or
  deformation.
- Added multi-start ICP registration.
- Added two-plane initialization using:
  - The dominant side/indexing flat surface.
  - The perpendicular top flat surface.
- Registered library copies are nested under their original scan group.
- Scanbodies receive a blue-to-red surface-deviation color map.
- Added a deviation legend in millimeters.
- Added a controllable deviation scale:
  - Slider control.
  - Exact numeric maximum.
  - Range from 0.05 mm to 100 mm.
  - Live recoloring of registered scanbodies.

## 3. Registration decisions and experiments

- The original principal-axis-only initialization was not accurate enough.
- Two-plane initialization was added before ICP to improve rotational
  orientation.
- A later experiment forced the top and side planes to snap exactly after ICP.
- The forced post-ICP plane lock produced worse results and was rolled back.
- The current registration method is:
  1. Detect top and side planar surfaces.
  2. Generate two-plane initial alignments.
  3. Run rigid ICP.
  4. Select the candidate with the lowest matching error.

## 4. Current status

The application is operational in the Codex preview on port 5001. The current
build includes:

- Dual-category STL upload.
- Native-coordinate Z-up visualization.
- Hierarchical object visibility.
- 5 mm scanbody isolation.
- Rigid library-to-scanbody registration.
- Deviation color mapping with an adjustable scale.
- Library-focused camera centering.

The latest registration improvement retained is two-plane initialization plus
ICP. The post-ICP hard plane-lock experiment is not active.

## 5. Known issues and limitations

- Registration quality is still under evaluation and may vary between
  scanbodies.
- Flat-surface detection is automatic and may select an incorrect planar patch
  when scan geometry is incomplete or noisy.
- ICP uses sampled surface points and nearest-neighbor matching.
- Registration does not currently expose manual correction controls.
- The 5 mm isolation grouping threshold is fixed.
- Isolated or registered objects cannot yet be exported as STL files.
- Projects and scene state are lost after a page reload.
- Uploaded files remain in the local `uploads` folder until manually removed.
- Three.js is loaded from an online CDN.
- Flask is currently running as a local development server.

## 6. Recommended next steps

1. Add visual selection or confirmation of the detected top and side planes.
2. Add manual translation and rotation adjustment after automatic registration.
3. Display registration metrics for each scanbody, including RMS and maximum
   deviation.
4. Allow the isolation distance threshold to be edited.
5. Export isolated scanbodies and registered library copies as STL files.
6. Save and restore projects.
7. Move registration into a Web Worker or backend process for larger files.
8. Add automated registration tests using known transformed library models.

## 7. Current operating sequence

1. Upload the Scan Body Library.
2. Upload one or more scan STL files.
3. Click **Isolate Scanbodies**.
4. Review the generated scanbody groups and visibility.
5. Click **Registration**.
6. Inspect registered library overlays and deviation maps.
7. Adjust the deviation scale as needed.
8. Use **Center Library** or **Fit View** to recover the camera view.
