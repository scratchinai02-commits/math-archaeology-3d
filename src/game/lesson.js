/**
 * 目前的課程：圓面積從哪裡來？
 * 之後可以依 world / 講義切換不同的課程 JSON。
 */

import circleArea from '../data/lessons/circle-area.json'

export const LESSON = circleArea
export const LEVELS = Object.freeze(circleArea.levels)

/** 關卡可以開放的工具 */
export const TOOLS = Object.freeze(['radius', 'angle', 'slices', 'rearrange'])

/**
 * 關卡開始時把參數設回指定值，避免一開場就自動過關。
 * actions 是 useMathStore 的 setter（測試時可傳入假的物件）。
 */
export function applyLevelSetup(setup = {}, actions) {
  if ('radius' in setup) actions.setCircleRadius(setup.radius)
  if ('angleDeg' in setup) actions.setSectorAngle((setup.angleDeg * Math.PI) / 180)
  if ('slices' in setup) actions.setSliceCount(setup.slices)
  if ('rearrange' in setup) actions.setRearrange(setup.rearrange)
}
