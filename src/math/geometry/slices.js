/**
 * 圓的切片 CircleSlices（純數學演算法）
 *
 * 把半徑 r 的圓切成 n 片一樣大的扇形，每片圓心角 α = 2π / n。
 *
 * 每一片都共用同一個「局部扇形」：頂點在原點，圓弧從 θ = 0 到 θ = α。
 * 第 i 片只要繞 y 軸旋轉 −iα（Three.js 的 rotation.y），就回到圓上自己的位置。
 * 所以畫面上的每一片都是真正的數學扇形，而不是把一張圓的圖片切開。
 */

import { TAU } from '../algorithms/angle.js'
import { assertFiniteNumber, assertIntegerAtLeast, assertPositiveNumber } from '../algorithms/validate.js'
import { arcSegmentsFor, createSectorPoints } from './sector.js'

/** 設計文件 5.2：依序產生 8、16、32、64、128 個扇形（另加 4 片當入門） */
export const SLICE_COUNTS = Object.freeze([4, 8, 16, 32, 64, 128])

/** 切片數必須是 ≥ 2 的偶數（之後要一上一下交錯排列） */
export function assertSliceCount(count) {
  assertIntegerAtLeast(count, 2, 'count')
  if (count % 2 !== 0) throw new RangeError(`切片數必須是偶數，收到：${count}`)
}

/** 每片的圓心角 α = 2π / n */
export function sliceAngle(count) {
  assertSliceCount(count)
  return TAU / count
}

/**
 * 局部扇形的圓弧：頂點在原點，θ 從 0 到 α。
 * 分段數依圓心角比例分配（每圈 segmentsPerTurn 段，至少 1 段）。
 */
export function createSliceArcPoints(radius, count, segmentsPerTurn = 128) {
  const alpha = sliceAngle(count)
  return createSectorPoints(radius, 0, alpha, arcSegmentsFor(alpha, segmentsPerTurn))
}

/**
 * 設計文件 5.3：sliceCircle(radius, sliceCount)
 *
 * 每一片：
 *   { index, startAngle, endAngle, rotation, position }
 *   rotation = −startAngle（Three.js rotation.y）
 *   position = 沿該片角平分線往外推 gap（切開的縫隙；gap = 0 時就是完整的圓）
 */
export function sliceCircle(radius, count, { gap = 0 } = {}) {
  assertPositiveNumber(radius, 'radius')
  assertFiniteNumber(gap, 'gap')
  if (gap < 0) throw new RangeError(`gap 不可為負數，收到：${gap}`)

  const alpha = sliceAngle(count)

  return Array.from({ length: count }, (_, index) => {
    const startAngle = index * alpha
    const endAngle = (index + 1) * alpha
    const mid = startAngle + alpha / 2

    return {
      index,
      startAngle,
      endAngle,
      rotation: -startAngle,
      position: [gap * Math.cos(mid), 0, gap * Math.sin(mid)],
    }
  })
}
