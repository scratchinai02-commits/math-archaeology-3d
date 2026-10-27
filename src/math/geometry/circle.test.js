import { describe, expect, it } from 'vitest'
import { circleArea, circleCircumference, createCirclePoints } from './circle.js'

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('createCirclePoints', () => {
  it('回傳 segments + 1 個點（最後一點用來閉合）', () => {
    expect(createCirclePoints(5, 8)).toHaveLength(9)
    expect(createCirclePoints(5, 128)).toHaveLength(129)
  })

  it('每個點都滿足 x² + z² = r²，且 y = 0（落在 x-z 平面）', () => {
    const r = 3.7
    for (const [x, y, z] of createCirclePoints(r, 64)) {
      expect(Math.hypot(x, z)).toBeCloseTo(r, 10)
      expect(y).toBe(0)
    }
  })

  it('第 0 點在 θ = 0 → (r, 0, 0)，最後一點回到起點', () => {
    const points = createCirclePoints(2, 16)
    const first = points[0]
    const last = points[points.length - 1]

    expect(first[0]).toBeCloseTo(2, 12)
    expect(first[2]).toBeCloseTo(0, 12)
    expect(distance(first, last)).toBeCloseTo(0, 12)
  })

  it('θ 由 +x 往 +z 遞增：四等分時第 1 點在 (0, 0, r)', () => {
    const [, quarter] = createCirclePoints(4, 4)
    expect(quarter[0]).toBeCloseTo(0, 12)
    expect(quarter[2]).toBeCloseTo(4, 12)
  })

  it('等角取樣：相鄰兩點的弦長都等於 2r·sin(π/n)', () => {
    const r = 5
    const n = 12
    const points = createCirclePoints(r, n)
    const chord = 2 * r * Math.sin(Math.PI / n)

    for (let i = 0; i < n; i++) {
      expect(distance(points[i], points[i + 1])).toBeCloseTo(chord, 10)
    }
  })

  it('改變半徑是重新計算頂點：r 加倍，每個座標都加倍', () => {
    const small = createCirclePoints(2, 32)
    const big = createCirclePoints(4, 32)

    small.forEach((p, i) => {
      expect(big[i][0]).toBeCloseTo(p[0] * 2, 12)
      expect(big[i][2]).toBeCloseTo(p[2] * 2, 12)
    })
  })

  it('取樣折線的總長 < 2πr，且分段越多越逼近 2πr', () => {
    const r = 5
    const perimeter = (n) => {
      const pts = createCirclePoints(r, n)
      let sum = 0
      for (let i = 0; i < n; i++) sum += distance(pts[i], pts[i + 1])
      return sum
    }

    const exact = 2 * Math.PI * r
    const errors = [8, 16, 32, 64, 128].map((n) => exact - perimeter(n))

    errors.forEach((e) => expect(e).toBeGreaterThan(0))
    for (let i = 1; i < errors.length; i++) {
      expect(errors[i]).toBeLessThan(errors[i - 1])
    }
    expect(errors.at(-1)).toBeLessThan(0.01)
  })

  it('segments 預設為 64', () => {
    expect(createCirclePoints(1)).toHaveLength(65)
  })

  it('拒絕不合理的半徑', () => {
    expect(() => createCirclePoints(0, 8)).toThrow(RangeError)
    expect(() => createCirclePoints(-1, 8)).toThrow(RangeError)
    expect(() => createCirclePoints(Number.NaN, 8)).toThrow(RangeError)
    expect(() => createCirclePoints(Infinity, 8)).toThrow(RangeError)
    expect(() => createCirclePoints('5', 8)).toThrow(RangeError)
  })

  it('拒絕不合理的分段數', () => {
    expect(() => createCirclePoints(5, 2)).toThrow(RangeError)
    expect(() => createCirclePoints(5, 8.5)).toThrow(RangeError)
    expect(() => createCirclePoints(5, 0)).toThrow(RangeError)
  })
})

describe('circleCircumference / circleArea', () => {
  it('C = 2πr', () => {
    expect(circleCircumference(1)).toBeCloseTo(2 * Math.PI, 12)
    expect(circleCircumference(5)).toBeCloseTo(31.4159265, 6)
  })

  it('A = πr²', () => {
    expect(circleArea(1)).toBeCloseTo(Math.PI, 12)
    expect(circleArea(5)).toBeCloseTo(78.5398163, 6)
  })

  it('拒絕不合理的半徑', () => {
    expect(() => circleCircumference(0)).toThrow(RangeError)
    expect(() => circleArea(-2)).toThrow(RangeError)
  })
})
