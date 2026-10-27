/**
 * 剛體變換（純數學，不依賴 Three.js）。
 *
 * 旋轉方向與 Three.js 的 Object3D.rotation.y 完全相同：
 *   正角度會把 +x 轉向 −z，也就是點的角度 θ（由 +x 往 +z 量）會變成 θ − φ。
 * 這樣演算法算出的 { position, rotation } 可以直接交給 <group>。
 */

import { TAU } from './angle.js'

/** 繞 y 軸旋轉一個點 */
export function rotateY([x, y, z], angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [x * c + z * s, y, -x * s + z * c]
}

/** 先繞 y 軸旋轉、再平移（與 Object3D 的 rotation.y + position 相同） */
export function applyTransform(point, { position = [0, 0, 0], rotation = 0 } = {}) {
  const [x, y, z] = rotateY(point, rotation)
  return [x + position[0], y + position[1], z + position[2]]
}

/** 把角度換到 [−π, π) */
export function wrapAngle(angle) {
  return angle - TAU * Math.floor((angle + Math.PI) / TAU)
}

/** 回傳與 to 等價（差 2π 的整數倍）、且離 from 最近的角度，動畫才不會多轉一圈 */
export function shortestRotation(from, to) {
  return from + wrapAngle(to - from)
}
