/**
 * 共用的參數檢查。
 * 數學演算法收到不合理的輸入時要「大聲失敗」，
 * 而不是默默畫出一個錯的圖形。
 */

export function assertPositiveNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} 必須是大於 0 的有限數字，收到：${value}`)
  }
}

export function assertIntegerAtLeast(value, min, name) {
  if (!Number.isInteger(value) || value < min) {
    throw new RangeError(`${name} 必須是 ≥ ${min} 的整數，收到：${value}`)
  }
}
