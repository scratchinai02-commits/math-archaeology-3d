/**
 * 闖關進度（Zustand）：目前第幾關、哪些關已過、測驗答案、動態島展開與否。
 * 數學參數仍然只在 useMathStore。
 */

import { create } from 'zustand'
import { LEVELS } from '../game/lesson.js'

export const ISLAND_STATES = Object.freeze(['compact', 'expanded'])

const initialState = {
  levelIndex: 0,
  completed: [],
  quizAnswer: null,
  island: 'expanded',
  freeMode: false,
}

export const useGameStore = create((set) => ({
  ...initialState,

  completeLevel: (id) =>
    set((state) =>
      state.completed.includes(id) ? {} : { completed: [...state.completed, id], island: 'expanded' },
    ),

  nextLevel: () =>
    set((state) =>
      state.levelIndex < LEVELS.length - 1
        ? { levelIndex: state.levelIndex + 1, quizAnswer: null, island: 'expanded' }
        : { freeMode: true, island: 'compact' },
    ),

  goToLevel: (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= LEVELS.length) return
    set({ levelIndex: index, quizAnswer: null, island: 'expanded', freeMode: false })
  },

  answerQuiz: (optionId) => set({ quizAnswer: optionId }),

  setIsland: (island) => {
    if (ISLAND_STATES.includes(island)) set({ island })
  },

  toggleIsland: () => set((state) => ({ island: state.island === 'expanded' ? 'compact' : 'expanded' })),

  setFreeMode: (freeMode) => set({ freeMode: Boolean(freeMode), island: freeMode ? 'compact' : 'expanded' }),

  restart: () => set({ ...initialState }),
}))

export default useGameStore
