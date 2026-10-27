import { describe, expect, it } from 'vitest'
import { TAU, degToRad, formatPiFraction, radToDeg } from './angle.js'

describe('degToRad / radToDeg', () => {
  it('180° = π，360° = 2π', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 15)
    expect(degToRad(360)).toBeCloseTo(TAU, 15)
    expect(radToDeg(Math.PI / 3)).toBeCloseTo(60, 12)
  })

  it('來回轉換不變', () => {
    for (const deg of [1, 45, 90, 137, 270, 360]) {
      expect(radToDeg(degToRad(deg))).toBeCloseTo(deg, 10)
    }
  })
})

describe('formatPiFraction', () => {
  it('整數度數寫成最簡 π 分數', () => {
    expect(formatPiFraction(180)).toBe('π')
    expect(formatPiFraction(360)).toBe('2π')
    expect(formatPiFraction(60)).toBe('π/3')
    expect(formatPiFraction(90)).toBe('π/2')
    expect(formatPiFraction(120)).toBe('2π/3')
    expect(formatPiFraction(45)).toBe('π/4')
    expect(formatPiFraction(270)).toBe('3π/2')
    expect(formatPiFraction(1)).toBe('π/180')
    expect(formatPiFraction(100)).toBe('5π/9')
  })

  it('0 與負角度', () => {
    expect(formatPiFraction(0)).toBe('0')
    expect(formatPiFraction(-90)).toBe('−π/2')
    expect(formatPiFraction(-180)).toBe('−π')
  })

  it('非整數度數回傳 null', () => {
    expect(formatPiFraction(22.5)).toBeNull()
  })
})
