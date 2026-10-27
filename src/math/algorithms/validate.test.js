import { describe, expect, it } from 'vitest'
import { assertFiniteNumber, assertIntegerAtLeast, assertPositiveNumber } from './validate.js'

describe('assertFiniteNumber', () => {
  it('接受任何有限數字（含 0 與負數）', () => {
    for (const ok of [0, -3.5, 2 * Math.PI]) {
      expect(() => assertFiniteNumber(ok, 'x')).not.toThrow()
    }
  })

  it('拒絕 NaN、Infinity 與非數字', () => {
    for (const bad of [Number.NaN, Infinity, -Infinity, '1', null, undefined]) {
      expect(() => assertFiniteNumber(bad, 'x')).toThrow(RangeError)
    }
  })
})

describe('assertPositiveNumber', () => {
  it('接受大於 0 的有限數字', () => {
    expect(() => assertPositiveNumber(0.001, 'x')).not.toThrow()
    expect(() => assertPositiveNumber(10, 'x')).not.toThrow()
  })

  it('拒絕 0、負數、NaN、Infinity、字串', () => {
    for (const bad of [0, -1, Number.NaN, Infinity, '3', null, undefined]) {
      expect(() => assertPositiveNumber(bad, 'x')).toThrow(RangeError)
    }
  })
})

describe('assertIntegerAtLeast', () => {
  it('接受 ≥ min 的整數', () => {
    expect(() => assertIntegerAtLeast(3, 3, 'n')).not.toThrow()
    expect(() => assertIntegerAtLeast(128, 3, 'n')).not.toThrow()
  })

  it('拒絕小數、太小的值與非數字', () => {
    for (const bad of [2, 3.5, Number.NaN, '4']) {
      expect(() => assertIntegerAtLeast(bad, 3, 'n')).toThrow(RangeError)
    }
  })
})
