/**
 * 網格資料 → THREE.BufferGeometry
 *
 * 這是數學層與 3D 引擎之間唯一的接點：
 * 只負責把演算法算出的 positions / indices 交給 Three.js，
 * 不做任何「看起來像」的捷徑（不縮放現成模型、不載入 GLB、不用圖片）。
 */

import { BufferAttribute, BufferGeometry } from 'three'

/**
 * @param {{ positions: Float32Array, indices?: Uint32Array }} meshData
 * @param {{ computeNormals?: boolean }} [options]
 * @returns {BufferGeometry}
 */
export function toBufferGeometry({ positions, indices }, { computeNormals = true } = {}) {
  const geometry = new BufferGeometry()

  geometry.setAttribute('position', new BufferAttribute(positions, 3))

  if (indices) {
    geometry.setIndex(new BufferAttribute(indices, 1))
  }

  if (computeNormals) {
    geometry.computeVertexNormals()
  }

  geometry.computeBoundingSphere()

  return geometry
}
