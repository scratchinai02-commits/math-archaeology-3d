import MathWorld from '../scene/MathWorld.jsx'
import CirclePanel from '../components/ui/CirclePanel.jsx'

/**
 * App 只負責組合：3D 世界 + UI 面板。
 * 不在這裡寫數學、場景細節或狀態邏輯。
 */
export default function App() {
  return (
    <main className="app">
      <MathWorld />
      <CirclePanel />
    </main>
  )
}
