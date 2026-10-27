/**
 * 角度工具。演算法內部一律用弧度；度數只在介面上顯示。
 */

export const TAU = Math.PI * 2

/** 度 → 弧度 */
export function degToRad(degrees) {
  return (degrees * Math.PI) / 180
}

/** 弧度 → 度 */
export function radToDeg(radians) {
  return (radians * 180) / Math.PI
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

/**
 * 把整數度數寫成 π 的分數，例如 60 → "π/3"、270 → "3π/2"、360 → "2π"。
 * 非整數度數回傳 null（介面改顯示小數弧度）。
 */
export function formatPiFraction(degrees) {
  if (!Number.isInteger(degrees)) return null
  if (degrees === 0) return '0'

  const divisor = gcd(Math.abs(degrees), 180)
  const numerator = degrees / divisor
  const denominator = 180 / divisor

  const sign = numerator < 0 ? '−' : ''
  const magnitude = Math.abs(numerator)
  const top = `${sign}${magnitude === 1 ? '' : magnitude}π`

  return denominator === 1 ? top : `${top}/${denominator}`
}
