import { describe, expect, it } from 'vitest'
import { assertIntegerAtLeast, assertPositiveNumber } from './validate.js'

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
