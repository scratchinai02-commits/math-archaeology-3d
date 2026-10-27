import { SLICE_COUNTS } from '../../math/geometry/slices.js'
import { useMathStore } from '../../store/useMathStore.js'
import SegmentedControl from './SegmentedControl.jsx'

const OPTIONS = SLICE_COUNTS.map((n) => ({ value: n, label: String(n) }))

export default function SliceCountPicker() {
  const count = useMathStore((state) => state.circle.slices)
  const setSliceCount = useMathStore((state) => state.setSliceCount)

  return (
    <div className="field">
      <div className="field__label">
        切成 <var>n</var> 片
      </div>
      <SegmentedControl
        label="切片數"
        options={OPTIONS}
        value={count}
        onChange={setSliceCount}
        size="sm"
      />
    </div>
  )
}
