import { useId } from 'react'

/**
 * 通用參數滑桿（純介面元件，不知道 store 的存在）。
 * 半徑、圓心角、之後的 a/b/c、切片數…都用它。
 */
export default function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  valueText,
  scaleLabels = [min, max],
}) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100

  return (
    <div className="slider">
      <div className="slider__head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="slider__value">
          {display}
        </output>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-valuetext={valueText}
        style={{ '--fill': `${fill}%` }}
      />

      <div className="slider__scale" aria-hidden="true">
        <span>{scaleLabels[0]}</span>
        <span>{scaleLabels[1]}</span>
      </div>
    </div>
  )
}
