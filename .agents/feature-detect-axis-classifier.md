# Feature Detect Axis Classifier

## Decision

Feature Detect should identify the two flat features needed for scanbody alignment review:

- the top ring surface;
- the square side flat surface.

Generic area-ranked planar patches are not enough because STL cylinder walls are tessellated into many locally flat facets. The detector now estimates the scanbody long axis from area-distributed seed normals, then classifies candidate planar patches relative to that axis.

## Glossary

- **Long axis**: the cylinder/scanbody axis estimated from seed normals. Cylinder side normals are mostly perpendicular to this axis.
- **Top ring face**: the annular top surface. Its plane normal is expected to be parallel to the long axis.
- **Side square face**: the intentional rectangular flat side. Its plane normal is expected to be perpendicular to the long axis, and its long frame axis should run parallel to the long axis.
- **Cylinder side facet**: a locally flat STL facet on the curved cylinder wall. It should not be selected as a target flat feature.

## Classifier Defaults

- Top ring normal alignment: `abs(normal dot longAxis) >= 0.85`.
- Side face normal alignment: `abs(normal dot longAxis) <= 0.25`.
- Side face long-axis alignment: `abs(frame.majorAxis dot longAxis) >= 0.75`.
- Minimum displayed frame size: `2 mm x 2 mm`.

## Seed Filtering

After the long axis is estimated, Feature Detect splits detector seeds into:

- **Active seeds**: used for planar candidate generation and drawn with the normal seed color.
- **Excluded radial seeds**: drawn red and not used to generate planar candidates.
- **Added axis-parallel seeds**: 80 extra active seeds selected from non-base-seed triangles with `abs(normal dot longAxis) >= 0.85`.

A base seed is excluded only when both are true:

- its normal is not close to parallel to the long axis: `abs(normal dot longAxis) < 0.85`;
- the shortest distance between the seed-normal infinite line and the long-axis infinite line is less than `0.5 mm`.

Seeds with normals close to parallel to the long axis are never excluded by this radial-line test.
