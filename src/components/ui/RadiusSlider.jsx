import { useId } from 'react'
import { CIRCLE_RADIUS_LIMITS, useMathStore } from '../../store/useMathStore.js'

/**
 * 半徑滑桿：只寫入 Zustand，不直接碰 3D。
 *   Slider → Zustand → Circle3D 重新計算頂點
 */
export default function RadiusSlider() {
  const id = useId()
  const radius = useMathStore((state) => state.circle.radius)
  const setCircleRadius = useMathStore((state) => state.setCircleRadius)

  const { min, max, step } = CIRCLE_RADIUS_LIMITS
  const fill = ((radius - min) / (max - min)) * 100

  return (
    <div className="slider">
      <div className="slider__head">
        <label htmlFor={id}>
          半徑 <var>r</var>
        </label>
        <output htmlFor={id} className="slider__value">
          {radius.toFixed(1)}
        </output>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={radius}
        onChange={(event) => setCircleRadius(event.target.value)}
        aria-valuetext={`半徑 ${radius.toFixed(1)}`}
        style={{ '--fill': `${fill}%` }}
      />

      <div className="slider__scale" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
