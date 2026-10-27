import { describe, expect, it } from 'vitest'
import { createCirclePoints } from '../geometry/circle.js'
import { createDiskMeshData, createFanIndices, flattenPoints } from './meshData.js'

describe('flattenPoints', () => {
  it('把 [[x,y,z], …] 攤平成 Float32Array', () => {
    const flat = flattenPoints([
      [1, 2, 3],
      [4, 5, 6],
    ])

    expect(flat).toBeInstanceOf(Float32Array)
    expect(Array.from(flat)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('空陣列回傳長度 0', () => {
    expect(flattenPoints([])).toHaveLength(0)
  })
})

describe('createFanIndices', () => {
  it('ringCount 個外圈點 → ringCount − 1 個三角形', () => {
    expect(createFanIndices(2)).toHaveLength(3)
    expect(createFanIndices(9)).toHaveLength(24)
  })

  it('每個三角形是 (中心 0, 下一點, 這一點)', () => {
    expect(Array.from(createFanIndices(4))).toEqual([0, 2, 1, 0, 3, 2, 0, 4, 3])
  })

  it('所有索引都在 0 … ringCount 範圍內', () => {
    const ring = 33
    for (const index of createFanIndices(ring)) {
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThanOrEqual(ring)
    }
  })

  it('拒絕少於 2 個外圈點', () => {
    expect(() => createFanIndices(1)).toThrow(RangeError)
    expect(() => createFanIndices(2.5)).toThrow(RangeError)
  })
})

describe('createDiskMeshData', () => {
  const r = 5
  const segments = 16
  const ring = createCirclePoints(r, segments)
  const mesh = createDiskMeshData(ring)

  it('頂點 = 中心 + 外圈點；三角形數 = 分段數', () => {
    expect(mesh.vertexCount).toBe(segments + 2)
    expect(mesh.positions).toHaveLength((segments + 2) * 3)
    expect(mesh.triangleCount).toBe(segments)
  })

  it('第 0 個頂點是中心（原點）', () => {
    expect(Array.from(mesh.positions.slice(0, 3))).toEqual([0, 0, 0])
  })

  it('每個三角形的法向量都朝 +y（從上方看是正面）', () => {
    const p = (i) => [mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[i * 3 + 2]]

    for (let t = 0; t < mesh.triangleCount; t++) {
      const [a, b, c] = [0, 1, 2].map((k) => p(mesh.indices[t * 3 + k]))
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      const normalY = e1[2] * e2[0] - e1[0] * e2[2]

      expect(normalY).toBeGreaterThan(0)
    }
  })

  it('三角形面積總和 = 內接正 n 邊形面積 = ½·n·r²·sin(2π/n)', () => {
    const p = (i) => [mesh.positions[i * 3], mesh.positions[i * 3 + 2]]
    let area = 0

    for (let t = 0; t < mesh.triangleCount; t++) {
      const [a, b, c] = [0, 1, 2].map((k) => p(mesh.indices[t * 3 + k]))
      area += Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2
    }

    const expected = 0.5 * segments * r * r * Math.sin((2 * Math.PI) / segments)
    // positions 是 Float32Array，容許單精度誤差
    expect(area).toBeCloseTo(expected, 3)
  })

  it('可指定中心點', () => {
    const shifted = createDiskMeshData(ring, [1, 2, 3])
    expect(Array.from(shifted.positions.slice(0, 3))).toEqual([1, 2, 3])
  })
})
