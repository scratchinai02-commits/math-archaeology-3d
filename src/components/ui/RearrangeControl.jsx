import { useMathStore } from '../../store/useMathStore.js'
import ParamSlider from './ParamSlider.jsx'

/**
 * 重新排列：滑桿可以停在任何進度觀察切片怎麼移動，按鈕一鍵切換。
 */
export default function RearrangeControl() {
  const progress = useMathStore((state) => state.slicing.rearrange)
  const setRearrange = useMathStore((state) => state.setRearrange)
  const percent = Math.round(progress * 100)

  return (
    <div className="field">
      <ParamSlider
        label="重新排列"
        value={percent}
        min={0}
        max={100}
        step={1}
        onChange={(value) => setRearrange(Number(value) / 100)}
        display={`${percent}%`}
        valueText={`重新排列 ${percent}%`}
        scaleLabels={['圓', '一列']}
      />
      <div className="button-row">
        <button type="button" className="btn" onClick={() => setRearrange(0)} disabled={progress === 0}>
          拼回圓
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setRearrange(1)}
          disabled={progress === 1}
        >
          ▲▼ 排成一列
        </button>
      </div>
    </div>
  )
}
