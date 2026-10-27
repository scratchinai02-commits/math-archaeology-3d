import { describe, expect, it } from 'vitest'
import { clamp01, easeInOutCubic } from './easing.js'

describe('clamp01', () => {
  it('夾在 0 到 1', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(0.3)).toBe(0.3)
    expect(clamp01(2)).toBe(1)
  })
})

describe('easeInOutCubic', () => {
  it('端點與中點：f(0) = 0、f(½) = ½、f(1) = 1', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 15)
    expect(easeInOutCubic(1)).toBe(1)
  })

  it('單調遞增，且對中點對稱：f(t) + f(1 − t) = 1', () => {
    let previous = -1
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const value = easeInOutCubic(t)
      expect(value).toBeGreaterThanOrEqual(previous)
      expect(value + easeInOutCubic(1 - t)).toBeCloseTo(1, 12)
      previous = value
    }
  })

  it('範圍外的 t 會先夾住', () => {
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(3)).toBe(1)
  })
})
