import { describe, expect, it } from 'vitest'
import {
  ARROW_LENGTH,
  AXES,
  DEFAULT_AXIS_RANGES,
  createArrowHead,
  createAxisSegment,
  createCoordinateSystem,
  createTicks,
  createTickValues,
  onAxis,
  segmentsToLinePoints,
} from './axes.js'

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const length = (v) => Math.hypot(v[0], v[1], v[2])
const midpoint = ([a, b]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
const AXIS_INDEX = { x: 0, y: 1, z: 2 }

describe('onAxis', () => {
  it('回傳軸上的點', () => {
    expect(onAxis('x', 2)).toEqual([2, 0, 0])
    expect(onAxis('y', 3)).toEqual([0, 3, 0])
    expect(onAxis('z', -4)).toEqual([0, 0, -4])
  })

  it('拒絕不存在的軸', () => {
    expect(() => onAxis('w', 1)).toThrow(RangeError)
  })
})

describe('createAxisSegment', () => {
  it('從 min 到 max 的線段', () => {
    expect(createAxisSegment('x', -5, 5)).toEqual([
      [-5, 0, 0],
      [5, 0, 0],
    ])
    expect(createAxisSegment('y', 0, 6)).toEqual([
      [0, 0, 0],
      [0, 6, 0],
    ])
  })

  it('拒絕 min ≥ max 與不存在的軸', () => {
    expect(() => createAxisSegment('x', 3, 3)).toThrow(RangeError)
    expect(() => createAxisSegment('x', 5, -5)).toThrow(RangeError)
    expect(() => createAxisSegment('q', -1, 1)).toThrow(RangeError)
  })
})

describe('createTickValues', () => {
  it('列出 step 的倍數，不含 0', () => {
    expect(createTickValues(-3, 3, 1)).toEqual([-3, -2, -1, 1, 2, 3])
  })

  it('小數間距不產生浮點誤差（0.3 就是 0.3）', () => {
    const values = createTickValues(0, 1, 0.1)
    expect(values).toHaveLength(10)
    expect(values[2]).toBe(0.3)
    expect(values.at(-1)).toBe(1)
  })

  it('範圍端點不是倍數時只取範圍內的倍數', () => {
    expect(createTickValues(0.5, 3.2, 1)).toEqual([1, 2, 3])
    expect(createTickValues(-2.5, -0.5, 1)).toEqual([-2, -1])
  })

  it('拒絕不合理的 step 與範圍', () => {
    expect(() => createTickValues(0, 5, 0)).toThrow(RangeError)
    expect(() => createTickValues(0, 5, -1)).toThrow(RangeError)
    expect(() => createTickValues(5, 0, 1)).toThrow(RangeError)
  })
})

describe('createTicks', () => {
  const opts = { step: 1, majorEvery: 5, minorSize: 0.1, majorSize: 0.3, labelGap: 0.4 }

  for (const [axis, tickAxis] of [
    ['x', 'z'],
    ['y', 'x'],
    ['z', 'x'],
  ]) {
    it(`${axis} 軸：刻度在軸上、以刻度點為中點、方向沿 ${tickAxis}`, () => {
      const ticks = createTicks(axis, -6, 6, opts)
      expect(ticks).toHaveLength(12)

      for (const tick of ticks) {
        expect(tick.position).toEqual(onAxis(axis, tick.value))

        const mid = midpoint(tick.segment)
        tick.position.forEach((v, i) => expect(mid[i]).toBeCloseTo(v, 12))

        const dir = sub(tick.segment[1], tick.segment[0])
        expect(dir[AXIS_INDEX[axis]]).toBeCloseTo(0, 12)
        expect(Math.abs(dir[AXIS_INDEX[tickAxis]])).toBeCloseTo(length(dir), 12)
      }
    })
  }

  it('step × majorEvery 的倍數是主刻度，且比較長', () => {
    const ticks = createTicks('x', -10, 10, opts)
    const majors = ticks.filter((t) => t.major).map((t) => t.value)
    expect(majors).toEqual([-10, -5, 5, 10])

    for (const t of ticks) {
      const len = length(sub(t.segment[1], t.segment[0]))
      expect(len).toBeCloseTo(t.major ? 0.6 : 0.2, 12)
    }
  })

  it('標籤位置在刻度外側（主刻度長度 + 間距）', () => {
    const ticks = createTicks('x', 4, 6, opts)
    expect(ticks.map((t) => t.value)).toEqual([4, 5, 6])
    expect(ticks.find((t) => t.value === 5).labelPosition).toEqual([5, 0, 0.3 + 0.4])
  })

  it('拒絕 majorEvery < 1', () => {
    expect(() => createTicks('x', 0, 5, { majorEvery: 0 })).toThrow(RangeError)
  })
})

describe('createArrowHead', () => {
  it('兩條斜線都從尖端出發，往回 length、往兩側 width', () => {
    const [a, b] = createArrowHead('x', 10, { length: 0.5, width: 0.2 })

    expect(a[0]).toEqual([10, 0, 0])
    expect(b[0]).toEqual([10, 0, 0])
    expect(a[1]).toEqual([9.5, 0, 0.2])
    expect(b[1]).toEqual([9.5, 0, -0.2])
  })

  it('y 軸箭頭往兩側展開在 x 方向', () => {
    const [a, b] = createArrowHead('y', 6, { length: 0.5, width: 0.2 })
    expect(a[1]).toEqual([0.2, 5.5, 0])
    expect(b[1]).toEqual([-0.2, 5.5, 0])
  })

  it('負方向的箭頭會反向', () => {
    const [a] = createArrowHead('z', -4, { length: 0.5, width: 0.2 })
    expect(a[1]).toEqual([0.2, 0, -3.5])
  })

  it('tip = 0 無法判斷方向', () => {
    expect(() => createArrowHead('x', 0)).toThrow(RangeError)
  })
})

describe('segmentsToLinePoints', () => {
  it('把線段攤平成點序列', () => {
    expect(
      segmentsToLinePoints([
        [[0, 0, 0], [1, 0, 0]],
        [[2, 0, 0], [3, 0, 0]],
      ]),
    ).toEqual([
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [3, 0, 0],
    ])
  })
})

describe('createCoordinateSystem', () => {
  const system = createCoordinateSystem()

  it('包含 x、y、z 三條軸', () => {
    expect(Object.keys(system)).toEqual([...AXES])
  })

  it('軸線長度符合預設範圍', () => {
    for (const axis of AXES) {
      const [min, max] = DEFAULT_AXIS_RANGES[axis]
      expect(system[axis].segment).toEqual([onAxis(axis, min), onAxis(axis, max)])
    }
  })

  it('原點沒有刻度，箭頭範圍內也沒有刻度', () => {
    for (const axis of AXES) {
      const [, max] = DEFAULT_AXIS_RANGES[axis]
      for (const tick of system[axis].ticks) {
        expect(tick.value).not.toBe(0)
        expect(tick.value).toBeLessThanOrEqual(max - ARROW_LENGTH)
      }
    }
  })

  it('箭頭在正方向末端，軸名稱標籤在箭頭外', () => {
    for (const axis of AXES) {
      const [, max] = DEFAULT_AXIS_RANGES[axis]
      expect(system[axis].arrow[0][0]).toEqual(onAxis(axis, max))
      expect(system[axis].labelPosition[AXIS_INDEX[axis]]).toBeGreaterThan(max)
    }
  })

  it('預設：x、z 各有主刻度 ±5、±10；y 有 5', () => {
    const majors = (axis) => system[axis].ticks.filter((t) => t.major).map((t) => t.value)
    expect(majors('x')).toEqual([-10, -5, 5, 10])
    expect(majors('z')).toEqual([-10, -5, 5, 10])
    expect(majors('y')).toEqual([5])
  })
})
