/**
 * 動畫緩動函數（純數學）。
 */

export function clamp01(t) {
  return Math.min(1, Math.max(0, t))
}

/** 先慢、中間快、最後慢：f(0) = 0、f(½) = ½、f(1) = 1 */
export function easeInOutCubic(t) {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}
