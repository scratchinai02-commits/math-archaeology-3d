import { describe, expect, it } from 'vitest'
import { radToDeg } from '../math/algorithms/angle.js'
import { SLICE_COUNTS } from '../math/geometry/slices.js'
import { VIEWS } from '../store/useMathStore.js'
import { METRICS, collectMetrics, describeProgress, evaluateGoal, goalParts } from './goals.js'
import { LEVELS, TOOLS, applyLevelSetup } from './lesson.js'

const mathState = (over = {}) => ({
  circle: { radius: 5, slices: 8 },
  sector: { startAngle: 0, centralAngle: Math.PI / 3 },
  slicing: { rearrange: 0 },
  ...over,
})

describe('collectMetrics', () => {
  it('從 store 狀態算出所有 metrics', () => {
    const m = collectMetrics(mathState(), { quizAnswer: 'half' })
    expect(m.radius).toBe(5)
    expect(m.angleDeg).toBeCloseTo(60, 12)
    expect(m.arcOverRadius).toBeCloseTo(Math.PI / 3, 12)
    expect(m.sliceCount).toBe(8)
    expect(m.rearrange).toBe(0)
    expect(m.quizAnswer).toBe('half')
    expect(Object.keys(m).sort()).toEqual(Object.keys(METRICS).sort())
  })

  it('弧長 ÷ 半徑 = 圓心角（弧度），與半徑無關', () => {
    for (const radius of [1, 3.7, 10]) {
      const m = collectMetrics(mathState({ circle: { radius, slices: 8 }, sector: { startAngle: 0, centralAngle: 1.2 } }))
      expect(m.arcOverRadius).toBeCloseTo((radius * 1.2) / radius, 12)
    }
  })
})

describe('evaluateGoal', () => {
  const m = { radius: 4.02, angleDeg: 90, sliceCount: 64, rearrange: 1, quizAnswer: 'half' }

  it('equals：數字用容許誤差，文字要完全相同', () => {
    expect(evaluateGoal({ metric: 'radius', equals: 4, tolerance: 0.05 }, m)).toBe(true)
    expect(evaluateGoal({ metric: 'radius', equals: 4, tolerance: 0.01 }, m)).toBe(false)
    expect(evaluateGoal({ metric: 'quizAnswer', equals: 'half' }, m)).toBe(true)
    expect(evaluateGoal({ metric: 'quizAnswer', equals: 'full' }, m)).toBe(false)
  })

  it('atLeast / atMost / all', () => {
    expect(evaluateGoal({ metric: 'sliceCount', atLeast: 64 }, m)).toBe(true)
    expect(evaluateGoal({ metric: 'sliceCount', atMost: 32 }, m)).toBe(false)
    expect(
      evaluateGoal({ all: [{ metric: 'sliceCount', atLeast: 64 }, { metric: 'rearrange', equals: 1 }] }, m),
    ).toBe(true)
    expect(
      evaluateGoal({ all: [{ metric: 'sliceCount', atLeast: 64 }, { metric: 'rearrange', equals: 0 }] }, m),
    ).toBe(false)
  })

  it('未知的 metric 或缺少比較方式會報錯', () => {
    expect(() => evaluateGoal({ metric: 'mass', equals: 1 }, m)).toThrow()
    expect(() => evaluateGoal({ metric: 'radius' }, m)).toThrow()
  })
})

describe('describeProgress', () => {
  it('每個條件一行，含目前值、目標與是否完成；測驗不顯示', () => {
    const goal = { all: [{ metric: 'sliceCount', atLeast: 64 }, { metric: 'rearrange', equals: 1 }] }
    const rows = describeProgress(goal, { sliceCount: 16, rearrange: 1 })
    expect(rows).toEqual([
      { metric: 'sliceCount', label: 'n', current: '16', target: '≥ 64', done: false },
      { metric: 'rearrange', label: '排列', current: '100%', target: '100%', done: true },
    ])
    expect(describeProgress({ metric: 'quizAnswer', equals: 'half' }, { quizAnswer: null })).toEqual([])
  })
})

describe('圓面積課程 JSON', () => {
  it('關卡 id 不重複，畫面與工具都是已知的值', () => {
    const ids = LEVELS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const level of LEVELS) {
      expect(VIEWS).toContain(level.view)
      level.tools.forEach((tool) => expect(TOOLS).toContain(tool))
      goalParts(level.goal).forEach((part) => expect(Object.keys(METRICS)).toContain(part.metric))
      expect(level.mission.length).toBeGreaterThan(0)
      expect(level.success.length).toBeGreaterThan(0)
    }
  })

  it('測驗題的答案在選項裡，目標就是選對答案', () => {
    for (const level of LEVELS.filter((l) => l.quiz)) {
      expect(level.quiz.options.map((o) => o.id)).toContain(level.quiz.answer)
      expect(level.goal).toEqual({ metric: 'quizAnswer', equals: level.quiz.answer })
    }
  })

  it('每一關都能用介面上真的調得到的值過關（逐一搜尋滑桿與按鈕的值）', () => {
    const radii = Array.from({ length: 96 }, (_, i) => Number((0.5 + i * 0.1).toFixed(1)))
    const angles = Array.from({ length: 360 }, (_, i) => ((i + 1) * Math.PI) / 180)

    for (const level of LEVELS) {
      const used = new Set(goalParts(level.goal).map((p) => p.metric))
      const options = {
        radius: used.has('radius') ? radii : [5],
        angle: used.has('angleDeg') || used.has('arcOverRadius') ? angles : [Math.PI / 3],
        slices: used.has('sliceCount') ? SLICE_COUNTS : [8],
        rearrange: used.has('rearrange') ? [0, 1] : [0],
        quiz: level.quiz ? level.quiz.options.map((o) => o.id) : [null],
      }

      let reachable = false
      search: for (const radius of options.radius)
        for (const centralAngle of options.angle)
          for (const slices of options.slices)
            for (const rearrange of options.rearrange)
              for (const quizAnswer of options.quiz) {
                const state = mathState({
                  circle: { radius, slices },
                  sector: { startAngle: 0, centralAngle },
                  slicing: { rearrange },
                })
                if (evaluateGoal(level.goal, collectMetrics(state, { quizAnswer }))) {
                  reachable = true
                  break search
                }
              }
      expect(reachable, level.id).toBe(true)
    }
  })

  it('一弧度那關只有 57° 過關（弧長 = 半徑）', () => {
    const level = LEVELS.find((l) => l.id === 'one-radian')
    const passing = Array.from({ length: 360 }, (_, i) => i + 1).filter((deg) =>
      evaluateGoal(level.goal, collectMetrics(mathState({ sector: { startAngle: 0, centralAngle: (deg * Math.PI) / 180 } }))),
    )
    expect(passing).toEqual([57])
    expect(radToDeg(1)).toBeCloseTo(57.2958, 4)
  })
})

describe('applyLevelSetup', () => {
  it('依 setup 呼叫對應的 setter', () => {
    const calls = []
    const actions = {
      setCircleRadius: (v) => calls.push(['radius', v]),
      setSectorAngle: (v) => calls.push(['angle', v]),
      setSliceCount: (v) => calls.push(['slices', v]),
      setRearrange: (v) => calls.push(['rearrange', v]),
    }
    applyLevelSetup({ radius: 5, angleDeg: 90, slices: 8, rearrange: 0 }, actions)
    expect(calls.map((c) => c[0])).toEqual(['radius', 'angle', 'slices', 'rearrange'])
    expect(calls[1][1]).toBeCloseTo(Math.PI / 2, 12)

    calls.length = 0
    applyLevelSetup(undefined, actions)
    expect(calls).toEqual([])
  })
})
