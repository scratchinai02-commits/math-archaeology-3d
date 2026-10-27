import { CIRCLE_RADIUS_LIMITS, useMathStore } from '../../store/useMathStore.js'
import ParamSlider from './ParamSlider.jsx'

/**
 * 半徑滑桿：只寫入 Zustand，不直接碰 3D。
 *   Slider → Zustand → Circle3D / Sector3D 重新計算頂點
 */
export default function RadiusSlider() {
  const radius = useMathStore((state) => state.circle.radius)
  const setCircleRadius = useMathStore((state) => state.setCircleRadius)
  const { min, max, step } = CIRCLE_RADIUS_LIMITS

  return (
    <ParamSlider
      label={
        <>
          半徑 <var>r</var>
        </>
      }
      value={radius}
      min={min}
      max={max}
      step={step}
      onChange={setCircleRadius}
      display={radius.toFixed(1)}
      valueText={`半徑 ${radius.toFixed(1)}`}
    />
  )
}
