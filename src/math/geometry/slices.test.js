import { describe, expect, it } from 'vitest'
import { applyTransform } from '../algorithms/transform.js'
import {
  SLICE_COUNTS,
  createReferenceRectangle,
  createSliceArcPoints,
  createSliceLayout,
  rearrangeSlices,
  rearrangedDimensions,
  sliceAngle,
  sliceCircle,
} from './slices.js'

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

describe('rearrangedDimensions', () => {
  it('弦長 c = 2r sin(α/2)、高 h = r cos(α/2)、底 = (n/2)c', () => {
    const d = rearrangedDimensions(5, 8)
    expect(d.chord).toBeCloseTo(2 * 5 * Math.sin(Math.PI / 8), 12)
    expect(d.height).toBeCloseTo(5 * Math.cos(Math.PI / 8), 12)
    expect(d.base).toBeCloseTo(4 * d.chord, 12)
    expect(d.width).toBeCloseTo(d.base + d.chord / 2, 12)
  })

  it('面積 = 底 × 高 = ½·n·r²·sin(2π/n)（n 個三角形的面積）', () => {
    for (const n of SLICE_COUNTS) {
      const d = rearrangedDimensions(3, n)
      expect(d.area).toBeCloseTo(0.5 * n * 9 * Math.sin(TAU / n), 10)
    }
  })

  it('n 越大：底 → πr、高 → r、面積 → πr²（單調逼近）', () => {
    const r = 5
    const dims = SLICE_COUNTS.map((n) => rearrangedDimensions(r, n))
    for (let i = 1; i < dims.length; i++) {
      expect(dims[i].base).toBeGreaterThan(dims[i - 1].base)
      expect(dims[i].height).toBeGreaterThan(dims[i - 1].height)
      expect(dims[i].area).toBeGreaterThan(dims[i - 1].area)
    }
    const last = dims.at(-1)
    expect(last.base).toBeLessThan(Math.PI * r)
    expect(Math.PI * r - last.base).toBeLessThan(0.002)
    expect(r - last.height).toBeLessThan(0.002)
    expect((Math.PI * r * r - last.area) / (Math.PI * r * r)).toBeLessThan(0.001)
    expect(last.limitArea).toBeCloseTo(Math.PI * r * r, 12)
  })
})

describe('rearrangeSlices（▲▼ 交錯排列）', () => {
  const r = 4
  const n = 8
  const arc = createSliceArcPoints(r, n)
  const strip = rearrangeSlices(r, n)
  const d = rearrangedDimensions(r, n)
  const world = (slice) => arc.map((p) => applyTransform(p, slice))

  it('前半圈在上排（row 0），後半圈在下排（row 1）', () => {
    expect(strip.map((s) => s.row)).toEqual([0, 0, 0, 0, 1, 1, 1, 1])
  })

  it('上排頂點在 z = +h/2、弧朝 −z；下排頂點在 z = −h/2、弧朝 +z', () => {
    for (const slice of strip) {
      const pts = world(slice)
      const chordMid = [(pts[0][0] + pts.at(-1)[0]) / 2, 0, (pts[0][2] + pts.at(-1)[2]) / 2]
      if (slice.row === 0) {
        expect(slice.position[2]).toBeCloseTo(d.height / 2, 12)
        expect(chordMid[2]).toBeCloseTo(-d.height / 2, 10)
      } else {
        expect(slice.position[2]).toBeCloseTo(-d.height / 2, 12)
        expect(chordMid[2]).toBeCloseTo(d.height / 2, 10)
      }
      expect(chordMid[0]).toBeCloseTo(slice.position[0], 10)
    }
  })

  it('上下兩排剛好嵌合，沒有縫隙也沒有重疊', () => {
    const top = strip.filter((s) => s.row === 0)
    const bottom = strip.filter((s) => s.row === 1)
    const corners = (slice) => {
      const pts = world(slice)
      return [pts[0], pts.at(-1)].sort((a, b) => a[0] - b[0])
    }

    for (let j = 0; j < n / 2; j++) {
      const [bottomLeft, bottomRight] = corners(bottom[j])
      expectPointClose(top[j].position, bottomLeft)
      if (j + 1 < n / 2) expectPointClose(top[j + 1].position, bottomRight)

      const [topLeft, topRight] = corners(top[j])
      expectPointClose(bottom[j].position, topRight)
      if (j > 0) expectPointClose(bottom[j - 1].position, topLeft)
    }
  })

  it('整條排列以原點為中心，寬 W = (n/2)c + c/2', () => {
    const xs = strip.flatMap((s) => world(s).map((p) => p[0]))
    expect(Math.min(...xs)).toBeCloseTo(-d.width / 2, 10)
    expect(Math.max(...xs)).toBeCloseTo(d.width / 2, 10)
  })

  it('所有點都在 |z| ≤ r − h/2 之內（弧最多凸出 r − h）', () => {
    strip.forEach((s) => world(s).forEach((p) => expect(Math.abs(p[2])).toBeLessThanOrEqual(r - d.height / 2 + 1e-9)))
  })
})

describe('createSliceLayout', () => {
  it('from 與 sliceCircle 一致，to 與 rearrangeSlices 位置一致', () => {
    const layout = createSliceLayout(5, 16, { gap: 0.1 })
    const circle = sliceCircle(5, 16, { gap: 0.1 })
    const strip = rearrangeSlices(5, 16)

    layout.forEach((item, i) => {
      expect(item.from.position).toEqual(circle[i].position)
      expect(item.from.rotation).toBe(circle[i].rotation)
      expect(item.to.position).toEqual(strip[i].position)
      expect(item.row).toBe(strip[i].row)
    })
  })

  it('to.rotation 與目標等價，且最多只轉半圈', () => {
    const strip = rearrangeSlices(5, 32)
    createSliceLayout(5, 32).forEach((item, i) => {
      expect(Math.abs(item.to.rotation - item.from.rotation)).toBeLessThanOrEqual(Math.PI + 1e-12)
      expect(Math.cos(item.to.rotation)).toBeCloseTo(Math.cos(strip[i].rotation), 12)
      expect(Math.sin(item.to.rotation)).toBeCloseTo(Math.sin(strip[i].rotation), 12)
    })
  })
})

describe('createReferenceRectangle', () => {
  it('底 πr、高 r、以原點為中心的閉合長方形', () => {
    const rect = createReferenceRectangle(2)
    expect(rect).toHaveLength(5)
    expect(rect[0]).toEqual(rect[4])
    const xs = rect.map((p) => p[0])
    const zs = rect.map((p) => p[2])
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(2 * Math.PI, 12)
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(2, 12)
    expect(Math.max(...xs) + Math.min(...xs)).toBeCloseTo(0, 12)
  })
})
