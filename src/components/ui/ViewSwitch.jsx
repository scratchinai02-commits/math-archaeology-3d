import { useMathStore } from '../../store/useMathStore.js'
import SegmentedControl from './SegmentedControl.jsx'

const OPTIONS = [
  { value: 'circle', label: '圓與扇形' },
  { value: 'slices', label: '切片' },
]

export default function ViewSwitch() {
  const view = useMathStore((state) => state.view)
  const setView = useMathStore((state) => state.setView)

  return <SegmentedControl label="切換畫面" options={OPTIONS} value={view} onChange={setView} />
}
