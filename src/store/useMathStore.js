/**
 * Zustand：只管理「共享的」數學與互動狀態。
 *
 *   Slider → Zustand → 數學參數 → Algorithm → vertices → BufferGeometry → 3D 畫面
 *
 * 幾何資料（頂點、索引）不放在 store，
 * 由元件依參數即時呼叫演算法計算。
 */

import { create } from 'zustand'
import { TAU, degToRad } from '../math/algorithms/angle.js'
import { SLICE_COUNTS } from '../math/geometry/slices.js'

/** 畫面上顯示的數學物件：圓與扇形、切片 */
export const VIEWS = Object.freeze(['circle', 'slices'])

export const CIRCLE_RADIUS_LIMITS = Object.freeze({ min: 0.5, max: 10, step: 0.1 })

/** 扇形圓心角（弧度）：1° 到 2π */
export const SECTOR_ANGLE_LIMITS = Object.freeze({ min: degToRad(1), max: TAU })

/** 圓周取樣分段數：3D 圓與面板上的「取樣頂點」共用同一個值 */
export const CIRCLE_SEGMENTS = 128

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const useMathStore = create((set) => ({
  world: 'geometry',
  view: 'circle',

  circle: {
    radius: 5,
    slices: 8,
  },

  /** 扇形與圓共用半徑；角度一律為弧度 */
  sector: {
    startAngle: 0,
    centralAngle: Math.PI / 3,
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

  setView: (view) => {
    if (VIEWS.includes(view)) set({ view })
  },

  setSliceCount: (count) => {
    const value = Number(count)
    if (!SLICE_COUNTS.includes(value)) return
    set((state) => ({ circle: { ...state.circle, slices: value } }))
  },

  setCircleRadius: (radius) => {
    const value = Number(radius)
    if (!Number.isFinite(value)) return

    const { min, max } = CIRCLE_RADIUS_LIMITS
    set((state) => ({
      circle: { ...state.circle, radius: clamp(value, min, max) },
    }))
  },

  setSectorAngle: (angle) => {
    const value = Number(angle)
    if (!Number.isFinite(value)) return

    const { min, max } = SECTOR_ANGLE_LIMITS
    set((state) => ({
      sector: { ...state.sector, centralAngle: clamp(value, min, max) },
    }))
  },
}))

export default useMathStore
