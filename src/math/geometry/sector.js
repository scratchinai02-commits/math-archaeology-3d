/**
 * 扇形 Sector（純數學演算法）
 *
 *   中心 O = (0, 0, 0)
 *   Pᵢ = (r cos θᵢ, 0, r sin θᵢ)      θᵢ = θ₀ + (i / n)(θ₁ − θ₀)
 *
 * 扇形 = 圓心 O + 一段圓弧。實心扇形就是從圓心出發的三角扇，
 * 直接交給 meshData.js 的 createDiskMeshData(arcPoints)。
 * 圓是圓心角 2π 的扇形，所以 createCirclePoints() 也建立在這裡。
 */

import { TAU } from '../algorithms/angle.js'
import {
  assertFiniteNumber,
  assertIntegerAtLeast,
  assertPositiveNumber,
} from '../algorithms/validate.js'

/** 浮點數誤差容許值：圓心角允許到 2π + ε */
const SWEEP_EPSILON = 1e-9

/**
 * 取樣扇形的圓弧。
 *
 * 回傳 segments + 1 個點：第 0 點在 startAngle，最後一點在 endAngle。
 * θ 由 +x 軸往 +z 軸方向遞增。
 *
 * @param {number} radius     半徑 r（> 0）
 * @param {number} startAngle 起始角 θ₀（弧度）
 * @param {number} endAngle   終止角 θ₁（弧度，θ₀ < θ₁ ≤ θ₀ + 2π）
 * @param {number} segments   分段數（整數，≥ 1）
 * @returns {Array<[number, number, number]>}
 */
export function createSectorPoints(radius, startAngle, endAngle, segments = 32) {
  assertPositiveNumber(radius, 'radius')
  assertFiniteNumber(startAngle, 'startAngle')
  assertFiniteNumber(endAngle, 'endAngle')
  assertIntegerAtLeast(segments, 1, 'segments')

  const sweep = endAngle - startAngle
  if (!(sweep > 0) || sweep > TAU + SWEEP_EPSILON) {
    throw new RangeError(`圓心角（endAngle − startAngle）必須在 (0, 2π] 之間，收到：${sweep}`)
  }

  const points = []

  for (let i = 0; i <= segments; i++) {
    const theta = startAngle + (i / segments) * sweep

    points.push([
      radius * Math.cos(theta),
      0,
      radius * Math.sin(theta),
    ])
  }

  return points
}

/**
 * 扇形外框：O → 圓弧 → O 的閉合折線。
 * @param {Array<[number, number, number]>} arcPoints createSectorPoints 的結果
 */
export function createSectorOutlinePoints(arcPoints, center = [0, 0, 0]) {
  return [center, ...arcPoints, center]
}

/**
 * 依圓心角決定分段數，讓不同大小的扇形有一致的平滑度。
 * 例如每圈 128 段時，90° 的扇形用 32 段。
 */
export function arcSegmentsFor(sweep, segmentsPerTurn = 128) {
  assertPositiveNumber(sweep, 'sweep')
  assertIntegerAtLeast(segmentsPerTurn, 1, 'segmentsPerTurn')
  return Math.max(1, Math.ceil((sweep / TAU) * segmentsPerTurn - SWEEP_EPSILON))
}

/** 弧長 s = rθ */
export function arcLength(radius, angle) {
  assertPositiveNumber(radius, 'radius')
  assertPositiveNumber(angle, 'angle')
  return radius * angle
}

/** 扇形面積 A = ½ r² θ */
export function sectorArea(radius, angle) {
  assertPositiveNumber(radius, 'radius')
  assertPositiveNumber(angle, 'angle')
  return 0.5 * radius * radius * angle
}
