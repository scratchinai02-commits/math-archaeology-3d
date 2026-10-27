import { describe, expect, it } from 'vitest'
import { BufferGeometry } from 'three'
import { createCirclePoints } from '../geometry/circle.js'
import { toBufferGeometry } from './bufferGeometry.js'
import { createDiskMeshData } from './meshData.js'

describe('toBufferGeometry', () => {
  const r = 4
  const segments = 32
  const mesh = createDiskMeshData(createCirclePoints(r, segments))
  const geometry = toBufferGeometry(mesh)

  it('產生 THREE.BufferGeometry，頂點與索引數量與演算法一致', () => {
    expect(geometry).toBeInstanceOf(BufferGeometry)
    expect(geometry.getAttribute('position').count).toBe(mesh.vertexCount)
    expect(geometry.getIndex().count).toBe(mesh.triangleCount * 3)
  })

  it('頂點資料直接來自演算法（同一個 Float32Array）', () => {
    expect(geometry.getAttribute('position').array).toBe(mesh.positions)
  })

  it('計算出的法向量全部朝 +y', () => {
    const normals = geometry.getAttribute('normal')
    for (let i = 0; i < normals.count; i++) {
      expect(normals.getX(i)).toBeCloseTo(0, 6)
      expect(normals.getY(i)).toBeCloseTo(1, 6)
      expect(normals.getZ(i)).toBeCloseTo(0, 6)
    }
  })

  it('包圍球半徑 = r（圓心在原點）', () => {
    expect(geometry.boundingSphere.radius).toBeCloseTo(r, 4)
  })

  it('computeNormals: false 時不產生 normal attribute', () => {
    const plain = toBufferGeometry(mesh, { computeNormals: false })
    expect(plain.getAttribute('normal')).toBeUndefined()
  })

  it('沒有 indices 時不設定 index', () => {
    const lineLike = toBufferGeometry({ positions: mesh.positions }, { computeNormals: false })
    expect(lineLike.getIndex()).toBeNull()
  })
})
