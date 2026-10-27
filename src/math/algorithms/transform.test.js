import { describe, expect, it } from 'vitest'
import { Object3D, Vector3 } from 'three'
import { applyTransform, lerp, lerpTransform, rotateY, shortestRotation, wrapAngle } from './transform.js'

const expectPointClose = (a, b, digits = 12) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], digits))

describe('rotateY', () => {
  it('與 Three.js 的 Object3D.rotation.y 方向完全相同', () => {
    const samples = [
      [1, 0, 0],
      [0, 2, 3],
      [-1.5, 0.5, 2],
    ]
    for (const angle of [0, 0.3, Math.PI / 2, 2.5, -1.2]) {
      for (const p of samples) {
        const object = new Object3D()
        object.rotation.y = angle
        object.updateMatrixWorld()
        const expected = new Vector3(...p).applyMatrix4(object.matrixWorld)
        expectPointClose(rotateY(p, angle), [expected.x, expected.y, expected.z])
      }
    }
  })

  it('正角度把 +x 轉向 −z（點的角度 θ 變成 θ − φ）', () => {
    expectPointClose(rotateY([1, 0, 0], Math.PI / 2), [0, 0, -1])
  })

  it('旋轉不改變到 y 軸的距離', () => {
    const [x, , z] = rotateY([3, 1, 4], 1.234)
    expect(Math.hypot(x, z)).toBeCloseTo(5, 12)
  })
})

describe('applyTransform', () => {
  it('先旋轉、再平移，與 Object3D 的 position + rotation.y 相同', () => {
    const object = new Object3D()
    object.position.set(2, 0.5, -1)
    object.rotation.y = 0.8
    object.updateMatrixWorld()
    const p = [1, 0, 2]
    const expected = new Vector3(...p).applyMatrix4(object.matrixWorld)

    expectPointClose(applyTransform(p, { position: [2, 0.5, -1], rotation: 0.8 }), [
      expected.x,
      expected.y,
      expected.z,
    ])
  })

  it('沒有變換時回傳原點座標', () => {
    expect(applyTransform([1, 2, 3])).toEqual([1, 2, 3])
  })
})

describe('wrapAngle / shortestRotation', () => {
  it('wrapAngle 把角度換到 [−π, π)', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(-Math.PI, 12)
    expect(wrapAngle(Math.PI / 2 + 4 * Math.PI)).toBeCloseTo(Math.PI / 2, 12)
    expect(wrapAngle(-Math.PI / 3)).toBeCloseTo(-Math.PI / 3, 12)
  })

  it('shortestRotation 與目標等價，且離起點不超過 π', () => {
    for (const [from, to] of [
      [0, 3 * Math.PI / 2],
      [-5, 1],
      [2, -2],
      [-Math.PI, Math.PI / 2],
    ]) {
      const result = shortestRotation(from, to)
      expect(Math.abs(result - from)).toBeLessThanOrEqual(Math.PI + 1e-12)
      expect(Math.cos(result)).toBeCloseTo(Math.cos(to), 12)
      expect(Math.sin(result)).toBeCloseTo(Math.sin(to), 12)
    }
  })
})

describe('lerp / lerpTransform', () => {
  const from = { position: [0, 0, 0], rotation: 0 }
  const to = { position: [4, 0, -2], rotation: Math.PI }

  it('lerp：t = 0、½、1', () => {
    expect(lerp(2, 6, 0)).toBe(2)
    expect(lerp(2, 6, 0.5)).toBe(4)
    expect(lerp(2, 6, 1)).toBe(6)
  })

  it('t = 0 是起點、t = 1 是終點', () => {
    expect(lerpTransform(from, to, 0)).toEqual(from)
    expect(lerpTransform(from, to, 1, { lift: 3 })).toEqual(to)
  })

  it('途中沿 y 抬高，t = ½ 時剛好是 lift', () => {
    const mid = lerpTransform(from, to, 0.5, { lift: 3 })
    expect(mid.position).toEqual([2, 3, -1])
    expect(mid.rotation).toBeCloseTo(Math.PI / 2, 12)
  })

  it('不修改傳入的物件', () => {
    lerpTransform(from, to, 0.3, { lift: 1 })
    expect(from.position).toEqual([0, 0, 0])
  })
})
