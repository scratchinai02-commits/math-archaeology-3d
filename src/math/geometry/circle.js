/**
 * 圓 Circle（純數學演算法：不依賴 React，也不依賴 Three.js）
 *
 *   x = r cos θ
 *   z = r sin θ        0 ≤ θ ≤ 2π
 *
 * 圓放在 x-z 平面（y = 0），也就是 3D 場景的地面。
 * 圓就是圓心角 2π 的扇形，所以頂點由 createSectorPoints() 計算。
 * 學生改變半徑時，重新計算真正的頂點，而不是縮放圖片或縮放 Mesh。
 */

import { TAU } from '../algorithms/angle.js'
import { assertIntegerAtLeast, assertPositiveNumber } from '../algorithms/validate.js'
import { createSectorPoints } from './sector.js'

/**
 * 依參數方程式取樣圓周上的點。
 *
 * 回傳 segments + 1 個點：第 0 點在 θ = 0，最後一點在 θ = 2π，
 * 與第 0 點重合，讓折線可以直接閉合。
 * θ 由 +x 軸往 +z 軸方向遞增。
 *
 * @param {number} radius   半徑 r（> 0）
 * @param {number} segments 分段數（整數，≥ 3）
 * @returns {Array<[number, number, number]>}
 */
export function createCirclePoints(radius, segments = 64) {
  assertPositiveNumber(radius, 'radius')
  assertIntegerAtLeast(segments, 3, 'segments')

  return createSectorPoints(radius, 0, TAU, segments)
}

/** 圓周長 C = 2πr */
export function circleCircumference(radius) {
  assertPositiveNumber(radius, 'radius')
  return TAU * radius
}

/** 圓面積 A = πr² */
export function circleArea(radius) {
  assertPositiveNumber(radius, 'radius')
  return Math.PI * radius * radius
}
