/**
 * 座標系 CoordinateSystem（純數學演算法）
 *
 * 每條軸由三種線段組成，端點全部由演算法計算：
 *   1. 軸線：從 min 到 max
 *   2. 刻度：在每個 step 的倍數上，垂直於軸的短線段（主刻度較長）
 *   3. 箭頭：在正方向末端的兩條斜線
 *
 * 刻度方向：x 軸刻度沿 z、z 軸刻度沿 x（都畫在地面上），y 軸刻度沿 x。
 */

import { assertFiniteNumber, assertIntegerAtLeast, assertPositiveNumber } from '../algorithms/validate.js'

export const AXES = Object.freeze(['x', 'y', 'z'])

const AXIS_INDEX = { x: 0, y: 1, z: 2 }
const TICK_DIRECTION = { x: 'z', y: 'x', z: 'x' }
const EPSILON = 1e-9

/** 箭頭長度；座標系的刻度只畫到箭頭之前，避免重疊 */
export const ARROW_LENGTH = 0.45

function assertAxis(axis) {
  if (!(axis in AXIS_INDEX)) {
    throw new RangeError(`axis 必須是 'x'、'y' 或 'z'，收到：${axis}`)
  }
}

function assertRange(min, max) {
  assertFiniteNumber(min, 'min')
  assertFiniteNumber(max, 'max')
  if (!(min < max)) throw new RangeError(`min 必須小於 max，收到：${min}, ${max}`)
}

/** 軸上座標為 value 的點，例如 onAxis('y', 3) → [0, 3, 0] */
export function onAxis(axis, value) {
  assertAxis(axis)
  const point = [0, 0, 0]
  point[AXIS_INDEX[axis]] = value
  return point
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (v, k) => [v[0] * k, v[1] * k, v[2] * k]

/** 軸線：[起點, 終點] */
export function createAxisSegment(axis, min, max) {
  assertAxis(axis)
  assertRange(min, max)
  return [onAxis(axis, min), onAxis(axis, max)]
}

/**
 * [min, max] 之間 step 的所有倍數（不含 0，原點不畫刻度）。
 * 以整數倍計算再修正小數，避免 0.30000000000000004 這種值。
 */
export function createTickValues(min, max, step) {
  assertRange(min, max)
  assertPositiveNumber(step, 'step')

  const first = Math.ceil(min / step - EPSILON)
  const last = Math.floor(max / step + EPSILON)
  const values = []

  for (let i = first; i <= last; i++) {
    if (i === 0) continue
    values.push(Number((i * step).toFixed(10)))
  }

  return values
}

/**
 * 刻度。
 * @returns {Array<{ value: number, major: boolean, position: number[], segment: number[][], labelPosition: number[] }>}
 */
export function createTicks(
  axis,
  min,
  max,
  { step = 1, majorEvery = 5, minorSize = 0.12, majorSize = 0.25, labelGap = 0.35 } = {},
) {
  assertAxis(axis)
  assertIntegerAtLeast(majorEvery, 1, 'majorEvery')

  const direction = onAxis(TICK_DIRECTION[axis], 1)

  return createTickValues(min, max, step).map((value) => {
    const ratio = value / (step * majorEvery)
    const major = Math.abs(ratio - Math.round(ratio)) < EPSILON
    const half = major ? majorSize : minorSize
    const position = onAxis(axis, value)

    return {
      value,
      major,
      position,
      segment: [add(position, scale(direction, -half)), add(position, scale(direction, half))],
      labelPosition: add(position, scale(direction, majorSize + labelGap)),
    }
  })
}

/**
 * 箭頭：從 tip 往回畫兩條斜線，形成「>」。
 * tip 在負方向時箭頭自動反向。
 */
export function createArrowHead(axis, tip, { length = ARROW_LENGTH, width = 0.18 } = {}) {
  assertAxis(axis)
  assertFiniteNumber(tip, 'tip')
  if (tip === 0) throw new RangeError('tip 不可為 0（無法判斷箭頭方向）')

  const back = onAxis(axis, -Math.sign(tip) * length)
  const side = onAxis(TICK_DIRECTION[axis], width)
  const tipPoint = onAxis(axis, tip)
  const base = add(tipPoint, back)

  return [
    [tipPoint, add(base, side)],
    [tipPoint, add(base, scale(side, -1))],
  ]
}

/** 線段陣列 [[a, b], [c, d]] → 點陣列 [a, b, c, d]（給 segments 模式的線條使用） */
export function segmentsToLinePoints(segments) {
  return segments.flatMap(([a, b]) => [a, b])
}

export const DEFAULT_AXIS_RANGES = Object.freeze({
  x: Object.freeze([-12, 12]),
  y: Object.freeze([0, 6]),
  z: Object.freeze([-12, 12]),
})

/**
 * 組合三條軸的完整資料。
 * 正方向末端畫箭頭，所以刻度只畫到 max − 箭頭長度。
 */
export function createCoordinateSystem({
  ranges = DEFAULT_AXIS_RANGES,
  step = 1,
  majorEvery = 5,
  labelGap = 0.7,
} = {}) {
  return Object.fromEntries(
    AXES.map((axis) => {
      const [min, max] = ranges[axis]
      return [
        axis,
        {
          segment: createAxisSegment(axis, min, max),
          ticks: createTicks(axis, min, max - ARROW_LENGTH, { step, majorEvery }),
          arrow: createArrowHead(axis, max),
          labelPosition: onAxis(axis, max + labelGap),
        },
      ]
    }),
  )
}
