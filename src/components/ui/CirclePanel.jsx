import { useMathStore } from '../../store/useMathStore.js'
import CircleSectorTools from './CircleSectorTools.jsx'
import SliceTools from './SliceTools.jsx'
import ViewSwitch from './ViewSwitch.jsx'

/**
 * 工具面板（HTML 疊在 Canvas 上方）：依目前畫面顯示對應的工具。
 */
export default function CirclePanel() {
  const view = useMathStore((state) => state.view)

  return (
    <aside className="panel" aria-label="數學工具">
      <p className="panel__kicker">Math Archaeology 3D · 幾何之島</p>
      <ViewSwitch />

      {view === 'slices' ? <SliceTools /> : <CircleSectorTools />}

      <p className="panel__hint">拖曳旋轉　滾輪縮放　右鍵平移</p>
    </aside>
  )
}
