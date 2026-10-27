import { beforeEach, describe, expect, it } from 'vitest'
import { LEVELS } from '../game/lesson.js'
import { useGameStore } from './useGameStore.js'

const game = () => useGameStore.getState()

describe('useGameStore', () => {
  beforeEach(() => game().restart())

  it('從第 1 關開始，動態島展開', () => {
    expect(game()).toMatchObject({ levelIndex: 0, completed: [], quizAnswer: null, island: 'expanded', freeMode: false })
  })

  it('completeLevel 只記錄一次', () => {
    game().completeLevel('draw-circle')
    game().completeLevel('draw-circle')
    expect(game().completed).toEqual(['draw-circle'])
  })

  it('nextLevel 前進並清除測驗答案；最後一關之後進入自由探索', () => {
    game().answerQuiz('r')
    game().nextLevel()
    expect(game().levelIndex).toBe(1)
    expect(game().quizAnswer).toBeNull()

    game().goToLevel(LEVELS.length - 1)
    game().nextLevel()
    expect(game().levelIndex).toBe(LEVELS.length - 1)
    expect(game().freeMode).toBe(true)
  })

  it('goToLevel 忽略不存在的關卡', () => {
    game().goToLevel(99)
    game().goToLevel(-1)
    game().goToLevel(1.5)
    expect(game().levelIndex).toBe(0)
  })

  it('動態島只接受 compact / expanded，可切換', () => {
    game().setIsland('huge')
    expect(game().island).toBe('expanded')
    game().toggleIsland()
    expect(game().island).toBe('compact')
  })
})
