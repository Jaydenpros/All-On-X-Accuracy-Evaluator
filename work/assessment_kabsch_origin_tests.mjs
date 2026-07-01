import * as THREE from "../static/vendor/three/three.module.js";

const EPS = 1e-9;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function matrixRows(matrix) {
  const e = matrix.elements;
  return [
    [e[0], e[4], e[8], e[12]],
    [e[1], e[5], e[9], e[13]],
    [e[2], e[6], e[10], e[14]],
    [e[3], e[7], e[11], e[15]],
  ];
}

function matrixFromRows(rows) {
  return new THREE.Matrix4().set(...rows.flat());
}

function scanbody(matrix, rms = null) {
  return {
    matrix_4x4_row_major: matrixRows(matrix),
    rms_error_mm: rms,
  };
}

function scanFromMatrices(name, matrices, rmsValues = []) {
  return {
    name,
    scanbodies: matrices.map((matrix, index) => scanbody(matrix, rmsValues[index] ?? null)),
  };
}

function origin(scanbodyRecord) {
  return new THREE.Vector3().setFromMatrixPosition(matrixFromRows(scanbodyRecord.matrix_4x4_row_major));
}

function pairs(sourceScan, targetScan) {
  return sourceScan.scanbodies.map((scanbodyRecord, index) => [scanbodyRecord, targetScan.scanbodies[index]]);
}

function pointCentroid(points, weights = null) {
  const total = new THREE.Vector3();
  if (!weights) {
    points.forEach((point) => total.add(point));
    return total.multiplyScalar(1 / points.length);
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  points.forEach((point, index) => total.addScaledVector(point, weights[index]));
  return total.multiplyScalar(1 / totalWeight);
}

function largestEigenvector4(input) {
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

function kabsch(sourcePoints, targetPoints, weights = null) {
  const sourceCenter = pointCentroid(sourcePoints, weights);
  const targetCenter = pointCentroid(targetPoints, weights);
  const covariance = Array.from({ length: 3 }, () => [0, 0, 0]);
  sourcePoints.forEach((sourcePoint, index) => {
    const source = sourcePoint.clone().sub(sourceCenter);
    const target = targetPoints[index].clone().sub(targetCenter);
    const weight = weights ? weights[index] : 1;
    covariance[0][0] += weight * source.x * target.x;
    covariance[0][1] += weight * source.x * target.y;
    covariance[0][2] += weight * source.x * target.z;
    covariance[1][0] += weight * source.y * target.x;
    covariance[1][1] += weight * source.y * target.y;
    covariance[1][2] += weight * source.y * target.z;
    covariance[2][0] += weight * source.z * target.x;
    covariance[2][1] += weight * source.z * target.y;
    covariance[2][2] += weight * source.z * target.z;
  });
  const [sxx, sxy, sxz] = covariance[0];
  const [syx, syy, syz] = covariance[1];
  const [szx, szy, szz] = covariance[2];
  const eigenvector = largestEigenvector4([
    [sxx + syy + szz, syz - szy, szx - sxz, sxy - syx],
    [syz - szy, sxx - syy - szz, sxy + syx, szx + sxz],
    [szx - sxz, sxy + syx, -sxx + syy - szz, syz + szy],
    [sxy - syx, szx + sxz, syz + szy, -sxx - syy + szz],
  ]);
  const rotation = new THREE.Quaternion(eigenvector[1], eigenvector[2], eigenvector[3], eigenvector[0]).normalize();
  const translation = targetCenter.clone().sub(sourceCenter.clone().applyQuaternion(rotation));
  return new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1));
}

function originAlignment(sourceScan, targetScan, weighting = "uniform") {
  const sourcePoints = [];
  const targetPoints = [];
  const weights = [];
  pairs(sourceScan, targetScan).forEach(([source, target]) => {
    sourcePoints.push(origin(source));
    targetPoints.push(origin(target));
    if (weighting === "invVar" && source.rms_error_mm && target.rms_error_mm) {
      weights.push(1 / (source.rms_error_mm ** 2 + target.rms_error_mm ** 2 + 1e-6));
    } else if (weighting === "inv" && source.rms_error_mm && target.rms_error_mm) {
      weights.push(1 / (source.rms_error_mm + target.rms_error_mm + 1e-6));
    } else {
      weights.push(1);
    }
  });
  return kabsch(sourcePoints, targetPoints, weighting === "uniform" ? null : weights);
}

function rigidMatrix(axis, angle, translation) {
  const rotation = new THREE.Quaternion().setFromAxisAngle(axis.clone().normalize(), angle);
  return new THREE.Matrix4().compose(translation, rotation, new THREE.Vector3(1, 1, 1));
}

function matrixMaxDiff(first, second) {
  return Math.max(...first.elements.map((value, index) => Math.abs(value - second.elements[index])));
}

function localRotationOnly(matrix, axis, angle) {
  const originPoint = new THREE.Vector3().setFromMatrixPosition(matrix);
  const localRotation = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromAxisAngle(axis.clone().normalize(), angle),
  );
  const toOrigin = new THREE.Matrix4().makeTranslation(-originPoint.x, -originPoint.y, -originPoint.z);
  const back = new THREE.Matrix4().makeTranslation(originPoint.x, originPoint.y, originPoint.z);
  return back.multiply(localRotation).multiply(toOrigin).multiply(matrix);
}

const referenceOrigins = [
  new THREE.Vector3(-18, -5, 0),
  new THREE.Vector3(-10, 8, 1),
  new THREE.Vector3(-2, 13, -1),
  new THREE.Vector3(7, 10, 2),
  new THREE.Vector3(15, 1, -2),
  new THREE.Vector3(19, -9, 1.5),
];
const referenceMatrices = referenceOrigins.map((point, index) => rigidMatrix(
  new THREE.Vector3(index + 1, 2, 3),
  0.15 * (index + 1),
  point,
));
const groundTruth = rigidMatrix(new THREE.Vector3(0.4, -0.2, 0.9), 0.71, new THREE.Vector3(5, -3, 2));
const testMatrices = referenceMatrices.map((matrix) => groundTruth.clone().multiply(matrix));
const rmsValues = [0.04, 0.07, 0.05, 0.11, 0.06, 0.09];
const referenceScan = scanFromMatrices("reference", referenceMatrices, rmsValues);
const testScan = scanFromMatrices("test", testMatrices, rmsValues.map((value) => value * 1.2));

const stock = originAlignment(testScan, referenceScan, "uniform");
const weightedOff = originAlignment(testScan, referenceScan, "uniform");
assert(matrixMaxDiff(stock, weightedOff) < EPS, "Off weighting should match stock origins-only Kabsch.");

const perturbedTest = scanFromMatrices(
  "test-perturbed",
  testMatrices.map((matrix, index) => localRotationOnly(matrix, new THREE.Vector3(1, index + 1, 0.5), 0.33 + index * 0.07)),
  rmsValues,
);
const perturbed = originAlignment(perturbedTest, referenceScan, "invVar");
const weighted = originAlignment(testScan, referenceScan, "invVar");
assert(matrixMaxDiff(perturbed, weighted) < EPS, "Local scanbody rotations must not affect origin-only weighted Kabsch.");

const identity = originAlignment(referenceScan, referenceScan, "invVar");
assert(matrixMaxDiff(identity, new THREE.Matrix4()) < EPS, "Aligning a scan to itself should return identity.");

const recovered = originAlignment(testScan, referenceScan, "uniform");
const expected = groundTruth.clone().invert();
assert(matrixMaxDiff(recovered, expected) < 1e-6, "Known transform recovery failed.");

assert(Math.abs(recovered.determinant() - 1) < EPS, "Reflection guard failed; det(R) must be +1.");

console.log("assessment_kabsch_origin_tests: ok");
