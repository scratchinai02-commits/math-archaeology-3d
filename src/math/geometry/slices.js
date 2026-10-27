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
import { shortestRotation } from '../algorithms/transform.js'
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

/**
 * 重新排列後的尺寸（設計文件 5.4）。
 *
 * 每片是頂角 α、兩邊為 r 的扇形：
 *   弦長 c = 2r sin(α/2)，頂點到弦的高 h = r cos(α/2)
 * 上排放前半圈 n/2 片（弧朝外），下排放後半圈 n/2 片（弧朝內），左右錯開 c/2 互相嵌合：
 *   底 = (n/2)·c → πr，高 = h → r，面積 = 底 × 高 = ½·n·r²·sin α → πr²
 */
export function rearrangedDimensions(radius, count) {
  assertPositiveNumber(radius, 'radius')
  const alpha = sliceAngle(count)

  const chord = 2 * radius * Math.sin(alpha / 2)
  const height = radius * Math.cos(alpha / 2)
  const base = (count / 2) * chord

  return {
    chord,
    height,
    base,
    slant: chord / 2,
    width: base + chord / 2,
    area: base * height,
    limitBase: Math.PI * radius,
    limitHeight: radius,
    limitArea: Math.PI * radius * radius,
  }
}

/**
 * 設計文件 5.4：扇形交錯排列 ▲ ▼ ▲ ▼
 *
 * 第 i 片（圓上的順序）在排列後的位置：
 *   前半圈（row 0）：頂點在 z = +h/2，弧朝 −z；x = −W/2 + (j + ½)c
 *   後半圈（row 1）：頂點在 z = −h/2，弧朝 +z；x = −W/2 + (j + 1)c
 * 整條排列以原點為中心，寬 W = (n/2)c + c/2。
 */
export function rearrangeSlices(radius, count) {
  const alpha = sliceAngle(count)
  const { chord, height, width } = rearrangedDimensions(radius, count)
  const half = count / 2

  return Array.from({ length: count }, (_, index) => {
    const row = index < half ? 0 : 1
    const j = index - row * half

    return {
      index,
      row,
      position:
        row === 0
          ? [-width / 2 + (j + 0.5) * chord, 0, height / 2]
          : [-width / 2 + (j + 1) * chord, 0, -height / 2],
      rotation: row === 0 ? alpha / 2 + Math.PI / 2 : alpha / 2 - Math.PI / 2,
    }
  })
}

/**
 * 動畫用：每片從「圓上」(from) 到「排成一列」(to) 的變換。
 * to.rotation 會換成離 from 最近的等價角度，切片不會多轉一圈。
 */
export function createSliceLayout(radius, count, { gap = 0 } = {}) {
  const circle = sliceCircle(radius, count, { gap })
  const strip = rearrangeSlices(radius, count)

  return circle.map((slice, i) => ({
    index: slice.index,
    row: strip[i].row,
    startAngle: slice.startAngle,
    endAngle: slice.endAngle,
    from: { position: slice.position, rotation: slice.rotation },
    to: {
      position: strip[i].position,
      rotation: shortestRotation(slice.rotation, strip[i].rotation),
    },
  }))
}

/** 對照用的長方形：底 πr、高 r，以原點為中心（閉合折線） */
export function createReferenceRectangle(radius) {
  assertPositiveNumber(radius, 'radius')
  const halfBase = (Math.PI * radius) / 2
  const halfHeight = radius / 2

  return [
    [-halfBase, 0, -halfHeight],
    [halfBase, 0, -halfHeight],
    [halfBase, 0, halfHeight],
    [-halfBase, 0, halfHeight],
    [-halfBase, 0, -halfHeight],
  ]
}
