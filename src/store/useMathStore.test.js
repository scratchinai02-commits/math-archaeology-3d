import { beforeEach, describe, expect, it } from 'vitest'
import { CIRCLE_RADIUS_LIMITS, useMathStore } from './useMathStore.js'

const initialState = useMathStore.getState()

describe('useMathStore', () => {
  beforeEach(() => {
    useMathStore.setState(initialState, true)
  })

  it('初始狀態符合設計文件第 6 節', () => {
    const s = useMathStore.getState()
    expect(s.world).toBe('geometry')
    expect(s.circle).toEqual({ radius: 5, slices: 8 })
    expect(s.polygon).toEqual({ sides: 6, radius: 5 })
    expect(s.cone).toEqual({ radius: 4, height: 8 })
    expect(s.function2D).toEqual({ a: 1, b: 0, c: 0 })
  })

  it('setCircleRadius 更新半徑，且不影響 slices', () => {
    useMathStore.getState().setCircleRadius(7.5)
    expect(useMathStore.getState().circle).toEqual({ radius: 7.5, slices: 8 })
  })

  it('接受 slider 傳來的字串值', () => {
    useMathStore.getState().setCircleRadius('3.2')
    expect(useMathStore.getState().circle.radius).toBe(3.2)
  })

  it('超出範圍時夾在 min / max', () => {
    useMathStore.getState().setCircleRadius(999)
    expect(useMathStore.getState().circle.radius).toBe(CIRCLE_RADIUS_LIMITS.max)

    useMathStore.getState().setCircleRadius(-3)
    expect(useMathStore.getState().circle.radius).toBe(CIRCLE_RADIUS_LIMITS.min)
  })

  it('忽略非數字輸入', () => {
    useMathStore.getState().setCircleRadius('abc')
    expect(useMathStore.getState().circle.radius).toBe(5)
  })

  it('setWorld 切換世界', () => {
    useMathStore.getState().setWorld('function')
    expect(useMathStore.getState().world).toBe('function')
  })
})
