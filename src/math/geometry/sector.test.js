import { describe, expect, it } from 'vitest'
import { createDiskMeshData } from '../algorithms/meshData.js'
import { circleArea, circleCircumference, createCirclePoints } from './circle.js'
import {
  arcLength,
  arcSegmentsFor,
  createSectorOutlinePoints,
  createSectorPoints,
  sectorArea,
} from './sector.js'

const TAU = Math.PI * 2
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const angleOf = (p) => Math.atan2(p[2], p[0])

describe('createSectorPoints', () => {
  it('回傳 segments + 1 個圓弧點', () => {
    expect(createSectorPoints(5, 0, Math.PI / 2, 8)).toHaveLength(9)
    expect(createSectorPoints(5, 0, Math.PI / 2, 1)).toHaveLength(2)
  })

  it('每個點都在半徑 r 的圓上，且 y = 0', () => {
    for (const [x, y, z] of createSectorPoints(3, 0.3, 2.1, 20)) {
      expect(Math.hypot(x, z)).toBeCloseTo(3, 10)
      expect(y).toBe(0)
    }
  })

  it('第一點在 θ₀、最後一點在 θ₁', () => {
    const points = createSectorPoints(2, Math.PI / 6, (2 * Math.PI) / 3, 10)
    expect(angleOf(points[0])).toBeCloseTo(Math.PI / 6, 12)
    expect(angleOf(points.at(-1))).toBeCloseTo((2 * Math.PI) / 3, 12)
  })

  it('等角取樣：相鄰兩點的角度差 = 圓心角 / n', () => {
    const start = Math.PI / 4
    const end = Math.PI
    const n = 9
    const points = createSectorPoints(4, start, end, n)

    for (let i = 0; i < n; i++) {
      expect(angleOf(points[i + 1]) - angleOf(points[i])).toBeCloseTo((end - start) / n, 12)
    }
  })

  it('θ 由 +x 往 +z：0 到 π/2 的四分之一圓終點在 (0, 0, r)', () => {
    const last = createSectorPoints(5, 0, Math.PI / 2, 4).at(-1)
    expect(last[0]).toBeCloseTo(0, 12)
    expect(last[2]).toBeCloseTo(5, 12)
  })

  it('圓心角 2π 的扇形就是圓（與 createCirclePoints 完全相同）', () => {
    expect(createSectorPoints(3, 0, TAU, 32)).toEqual(createCirclePoints(3, 32))
  })

  it('可以從負角度開始', () => {
    const points = createSectorPoints(1, -Math.PI / 2, Math.PI / 2, 2)
    expect(points[1][0]).toBeCloseTo(1, 12)
    expect(points[1][2]).toBeCloseTo(0, 12)
  })

  it('拒絕圓心角 ≤ 0 或 > 2π', () => {
    expect(() => createSectorPoints(1, 1, 1, 4)).toThrow(RangeError)
    expect(() => createSectorPoints(1, 2, 1, 4)).toThrow(RangeError)
    expect(() => createSectorPoints(1, 0, TAU + 0.01, 4)).toThrow(RangeError)
  })

  it('允許浮點誤差範圍內的 2π', () => {
    expect(() => createSectorPoints(1, 0, (360 * Math.PI) / 180, 4)).not.toThrow()
  })

  it('拒絕不合理的半徑、角度與分段數', () => {
    expect(() => createSectorPoints(0, 0, 1, 4)).toThrow(RangeError)
    expect(() => createSectorPoints(1, Number.NaN, 1, 4)).toThrow(RangeError)
    expect(() => createSectorPoints(1, 0, Infinity, 4)).toThrow(RangeError)
    expect(() => createSectorPoints(1, 0, 1, 0)).toThrow(RangeError)
    expect(() => createSectorPoints(1, 0, 1, 2.5)).toThrow(RangeError)
  })
})

describe('createSectorOutlinePoints', () => {
  it('O → 圓弧 → O 的閉合折線', () => {
    const arc = createSectorPoints(2, 0, Math.PI / 3, 6)
    const outline = createSectorOutlinePoints(arc)

    expect(outline).toHaveLength(arc.length + 2)
    expect(outline[0]).toEqual([0, 0, 0])
    expect(outline.at(-1)).toEqual([0, 0, 0])
    expect(outline.slice(1, -1)).toEqual(arc)
  })
})

describe('扇形網格（三角扇）', () => {
  const triangleAreaSum = (mesh) => {
    const p = (i) => [mesh.positions[i * 3], mesh.positions[i * 3 + 2]]
    let area = 0
    for (let t = 0; t < mesh.triangleCount; t++) {
      const [a, b, c] = [0, 1, 2].map((k) => p(mesh.indices[t * 3 + k]))
      area += Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2
    }
    return area
  }

  it('三角形面積總和 = ½·n·r²·sin(θ/n)', () => {
    const r = 4
    const angle = (2 * Math.PI) / 3
    const n = 12
    const mesh = createDiskMeshData(createSectorPoints(r, 0, angle, n))

    expect(mesh.triangleCount).toBe(n)
    expect(triangleAreaSum(mesh)).toBeCloseTo(0.5 * n * r * r * Math.sin(angle / n), 3)
  })

  it('分段越多，面積越逼近 ½r²θ', () => {
    const r = 5
    const angle = Math.PI / 2
    const exact = sectorArea(r, angle)
    const errors = [2, 4, 8, 16, 64].map(
      (n) => exact - triangleAreaSum(createDiskMeshData(createSectorPoints(r, 0, angle, n))),
    )

    errors.forEach((e) => expect(e).toBeGreaterThan(0))
    for (let i = 1; i < errors.length; i++) expect(errors[i]).toBeLessThan(errors[i - 1])
    expect(errors.at(-1)).toBeLessThan(0.02)
  })
})

describe('arcSegmentsFor', () => {
  it('依圓心角比例分配分段數', () => {
    expect(arcSegmentsFor(TAU, 128)).toBe(128)
    expect(arcSegmentsFor(Math.PI, 128)).toBe(64)
    expect(arcSegmentsFor(Math.PI / 2, 128)).toBe(32)
  })

  it('很小的角度至少 1 段', () => {
    expect(arcSegmentsFor((1 * Math.PI) / 180, 128)).toBe(1)
    expect(arcSegmentsFor(1e-6, 128)).toBe(1)
  })

  it('拒絕不合理的輸入', () => {
    expect(() => arcSegmentsFor(0)).toThrow(RangeError)
    expect(() => arcSegmentsFor(1, 0)).toThrow(RangeError)
  })
})

describe('arcLength / sectorArea', () => {
  it('s = rθ，A = ½r²θ', () => {
    expect(arcLength(5, Math.PI / 3)).toBeCloseTo((5 * Math.PI) / 3, 12)
    expect(sectorArea(6, Math.PI / 3)).toBeCloseTo(6 * Math.PI, 12)
  })

  it('圓心角 2π 時等於圓周長與圓面積', () => {
    expect(arcLength(3, TAU)).toBeCloseTo(circleCircumference(3), 12)
    expect(sectorArea(3, TAU)).toBeCloseTo(circleArea(3), 12)
  })

  it('圓弧折線長度逼近 rθ', () => {
    const r = 5
    const angle = 1.2
    const points = createSectorPoints(r, 0, angle, 200)
    let sum = 0
    for (let i = 0; i < 200; i++) sum += distance(points[i], points[i + 1])
    expect(sum).toBeCloseTo(arcLength(r, angle), 3)
  })

  it('拒絕 r ≤ 0 或 θ ≤ 0', () => {
    expect(() => arcLength(0, 1)).toThrow(RangeError)
    expect(() => sectorArea(1, 0)).toThrow(RangeError)
  })
})
