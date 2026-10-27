/**
 * Zustand：只管理「共享的」數學與互動狀態。
 *
 *   Slider → Zustand → 數學參數 → Algorithm → vertices → BufferGeometry → 3D 畫面
 *
 * 幾何資料（頂點、索引）不放在 store，
 * 由元件依參數即時呼叫演算法計算。
 */

import { create } from 'zustand'

export const CIRCLE_RADIUS_LIMITS = Object.freeze({ min: 0.5, max: 10, step: 0.1 })

/** 圓周取樣分段數：3D 圓與面板上的「取樣頂點」共用同一個值 */
export const CIRCLE_SEGMENTS = 128

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const useMathStore = create((set) => ({
  world: 'geometry',

  circle: {
    radius: 5,
    slices: 8,
  },

  polygon: {
    sides: 6,
    radius: 5,
  },

  cone: {
    radius: 4,
    height: 8,
  },

  function2D: {
    a: 1,
    b: 0,
    c: 0,
  },

  setWorld: (world) => set({ world }),

  setCircleRadius: (radius) => {
    const value = Number(radius)
    if (!Number.isFinite(value)) return

    const { min, max } = CIRCLE_RADIUS_LIMITS
    set((state) => ({
      circle: { ...state.circle, radius: clamp(value, min, max) },
    }))
  },
}))

export default useMathStore
