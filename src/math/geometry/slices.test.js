import { describe, expect, it } from 'vitest'
import { applyTransform } from '../algorithms/transform.js'
import { SLICE_COUNTS, createSliceArcPoints, sliceAngle, sliceCircle } from './slices.js'

const TAU = Math.PI * 2
const angleOf = (p) => Math.atan2(p[2], p[0])
const expectPointClose = (a, b, digits = 10) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], digits))

describe('sliceAngle', () => {
  it('α = 2π / n', () => {
    expect(sliceAngle(8)).toBeCloseTo(Math.PI / 4, 15)
    expect(sliceAngle(16)).toBeCloseTo(0.392699, 6)
  })

  it('切片數必須是 ≥ 2 的偶數', () => {
    expect(() => sliceAngle(7)).toThrow(RangeError)
    expect(() => sliceAngle(0)).toThrow(RangeError)
    expect(() => sliceAngle(8.5)).toThrow(RangeError)
  })

  it('預設可選切片數都合法，且依序加倍', () => {
    expect(SLICE_COUNTS).toEqual([4, 8, 16, 32, 64, 128])
    SLICE_COUNTS.forEach((n) => expect(() => sliceAngle(n)).not.toThrow())
  })
})

describe('createSliceArcPoints（局部扇形）', () => {
  it('圓弧從 θ = 0 到 θ = α，點都在半徑 r 上', () => {
    const arc = createSliceArcPoints(5, 8)
    expect(angleOf(arc[0])).toBeCloseTo(0, 12)
    expect(angleOf(arc.at(-1))).toBeCloseTo(Math.PI / 4, 12)
    arc.forEach(([x, y, z]) => {
      expect(Math.hypot(x, z)).toBeCloseTo(5, 10)
      expect(y).toBe(0)
    })
  })

  it('分段數依圓心角比例分配：每圈 128 段時，8 片每片 16 段，128 片每片 1 段', () => {
    expect(createSliceArcPoints(1, 8)).toHaveLength(17)
    expect(createSliceArcPoints(1, 128)).toHaveLength(2)
  })
})

describe('sliceCircle', () => {
  it('回傳 n 片，格式符合設計文件 5.3', () => {
    const slices = sliceCircle(5, 16)
    expect(slices).toHaveLength(16)
    expect(Object.keys(slices[0]).sort()).toEqual(
      ['endAngle', 'index', 'position', 'rotation', 'startAngle'].sort(),
    )
  })

  it('第 0 片與設計文件範例相同：0 → 0.392699，rotation 0，position 原點', () => {
    const [first] = sliceCircle(5, 16)
    expect(first.index).toBe(0)
    expect(first.startAngle).toBe(0)
    expect(first.endAngle).toBeCloseTo(0.392699, 6)
    expect(first.rotation).toBeCloseTo(0, 15)
    expect(first.position).toEqual([0, 0, 0])
  })

  it('各片首尾相接，剛好鋪滿 0 到 2π', () => {
    const slices = sliceCircle(3, 32)
    expect(slices[0].startAngle).toBe(0)
    expect(slices.at(-1).endAngle).toBeCloseTo(TAU, 12)
    for (let i = 1; i < slices.length; i++) {
      expect(slices[i].startAngle).toBeCloseTo(slices[i - 1].endAngle, 12)
    }
  })

  it('套用變換後，第 i 片的圓弧剛好落在圓上 [iα, (i+1)α]', () => {
    const r = 4
    const n = 8
    const arc = createSliceArcPoints(r, n)
    for (const slice of sliceCircle(r, n)) {
      const world = arc.map((p) => applyTransform(p, slice))
      const start = world[0]
      const end = world.at(-1)
      expectPointClose(start, [r * Math.cos(slice.startAngle), 0, r * Math.sin(slice.startAngle)])
      expectPointClose(end, [r * Math.cos(slice.endAngle), 0, r * Math.sin(slice.endAngle)])
      world.forEach(([x, , z]) => expect(Math.hypot(x, z)).toBeCloseTo(r, 10))
    }
  })

  it('gap 讓每片沿角平分線往外移動 gap', () => {
    const gap = 0.2
    for (const slice of sliceCircle(5, 8, { gap })) {
      const [x, y, z] = slice.position
      expect(Math.hypot(x, z)).toBeCloseTo(gap, 12)
      expect(y).toBe(0)
      expect(angleOf(slice.position)).toBeCloseTo(
        Math.atan2(Math.sin(slice.startAngle + Math.PI / 8), Math.cos(slice.startAngle + Math.PI / 8)),
        12,
      )
    }
  })

  it('拒絕不合理的半徑、切片數與 gap', () => {
    expect(() => sliceCircle(0, 8)).toThrow(RangeError)
    expect(() => sliceCircle(5, 9)).toThrow(RangeError)
    expect(() => sliceCircle(5, 8, { gap: -0.1 })).toThrow(RangeError)
  })
})
