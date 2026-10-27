/**
 * 數學點 → GPU 資料（vertices / indices）
 *
 *   數學公式 → 頂點 vertices → indices → BufferGeometry → Mesh
 *
 * 這一層仍然是純數學（只用 TypedArray），不依賴 Three.js，
 * 之後的 Sector、Polygon、Cone 都會重用這裡的函式。
 */

import { assertIntegerAtLeast } from './validate.js'

/**
 * [[x, y, z], ...] → Float32Array [x0, y0, z0, x1, y1, z1, ...]
 */
export function flattenPoints(points) {
  const out = new Float32Array(points.length * 3)

  points.forEach((p, i) => {
    out[i * 3] = p[0]
    out[i * 3 + 1] = p[1]
    out[i * 3 + 2] = p[2]
  })

  return out
}

/**
 * 三角扇（triangle fan）索引。
 *
 * 頂點排列：index 0 是中心，1…ringCount 是外圈的點。
 * 每個三角形是 (中心, 下一點, 這一點)。外圈若照 θ 由 +x 往 +z 遞增排列
 * （createCirclePoints 的順序），法向量會朝 +y，也就是朝上。
 *
 * @param {number} ringCount 外圈點數（≥ 2）
 * @returns {Uint32Array} 長度 3 × (ringCount − 1)
 */
export function createFanIndices(ringCount) {
  assertIntegerAtLeast(ringCount, 2, 'ringCount')

  const triangleCount = ringCount - 1
  const indices = new Uint32Array(triangleCount * 3)

  for (let i = 0; i < triangleCount; i++) {
    const current = i + 1
    const next = i + 2

    indices[i * 3] = 0
    indices[i * 3 + 1] = next
    indices[i * 3 + 2] = current
  }

  return indices
}

/**
 * 由外圈的點建立實心圓盤（或任何星形區域）的網格資料。
 *
 * @param {Array<[number, number, number]>} ringPoints 外圈點（例如 createCirclePoints 的結果）
 * @param {[number, number, number]} center 中心點，預設原點
 */
export function createDiskMeshData(ringPoints, center = [0, 0, 0]) {
  const positions = flattenPoints([center, ...ringPoints])
  const indices = createFanIndices(ringPoints.length)

  return {
    positions,
    indices,
    vertexCount: ringPoints.length + 1,
    triangleCount: indices.length / 3,
  }
}
