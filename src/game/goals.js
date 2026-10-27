/**
 * 闖關目標（純邏輯，不依賴 React）。
 *
 * 關卡資料（src/data/lessons/*.json）只描述「要達成什麼」：
 *   { "metric": "radius", "equals": 4, "tolerance": 0.05 }
 *   { "all": [ …多個條件… ] }
 * 這裡負責：從目前的數學狀態算出 metrics、判斷是否過關、產生進度文字。
 * 之後由舊講義自動產生的關卡也用同一套格式。
 */

import { radToDeg } from '../math/algorithms/angle.js'

/** 可以當作目標的量，以及在動態島上的顯示方式 */
export const METRICS = Object.freeze({
  radius: { label: 'r', format: (v) => v.toFixed(1) },
  angleDeg: { label: 'θ', format: (v) => `${Math.round(v)}°` },
  arcOverRadius: { label: 's ÷ r', format: (v) => v.toFixed(3) },
  sliceCount: { label: 'n', format: (v) => String(v) },
  rearrange: { label: '排列', format: (v) => `${Math.round(v * 100)}%` },
  quizAnswer: { label: '答案', format: (v) => (v == null ? '—' : String(v)) },
})

/** 從 useMathStore / useGameStore 的狀態算出所有 metrics */
export function collectMetrics(math, game = {}) {
  const angle = math.sector.centralAngle
  return {
    radius: math.circle.radius,
    angleDeg: radToDeg(angle),
    // 弧長 ÷ 半徑 = (rθ) ÷ r = θ（弧度）
    arcOverRadius: angle,
    sliceCount: math.circle.slices,
    rearrange: math.slicing.rearrange,
    quizAnswer: game.quizAnswer ?? null,
  }
}

const EPSILON = 1e-9

function assertKnownMetric(metric) {
  if (!(metric in METRICS)) throw new Error(`未知的 metric：${metric}`)
}

/** 判斷單一條件或 all 組合是否成立 */
export function evaluateGoal(goal, metrics) {
  if (goal.all) return goal.all.every((part) => evaluateGoal(part, metrics))

  assertKnownMetric(goal.metric)
  const value = metrics[goal.metric]

  if ('equals' in goal) {
    if (typeof goal.equals === 'number') {
      const tolerance = goal.tolerance ?? EPSILON
      return typeof value === 'number' && Math.abs(value - goal.equals) <= tolerance + EPSILON
    }
    return value === goal.equals
  }
  if ('atLeast' in goal) return typeof value === 'number' && value >= goal.atLeast - EPSILON
  if ('atMost' in goal) return typeof value === 'number' && value <= goal.atMost + EPSILON

  throw new Error(`目標缺少比較方式：${JSON.stringify(goal)}`)
}

/** 目標裡用到的所有條件（攤平 all） */
export function goalParts(goal) {
  return goal.all ? goal.all.flatMap(goalParts) : [goal]
}

function formatTarget(part) {
  const { format } = METRICS[part.metric]
  if ('equals' in part) return typeof part.equals === 'number' ? format(part.equals) : null
  if ('atLeast' in part) return `≥ ${format(part.atLeast)}`
  if ('atMost' in part) return `≤ ${format(part.atMost)}`
  return null
}

/**
 * 動態島上的即時進度：每個條件一行。
 * 測驗題（quizAnswer）不顯示數值，由選項按鈕呈現。
 */
export function describeProgress(goal, metrics) {
  return goalParts(goal)
    .filter((part) => part.metric !== 'quizAnswer')
    .map((part) => {
      const { label, format } = METRICS[part.metric]
      return {
        metric: part.metric,
        label,
        current: format(metrics[part.metric]),
        target: formatTarget(part),
        done: evaluateGoal(part, metrics),
      }
    })
}
