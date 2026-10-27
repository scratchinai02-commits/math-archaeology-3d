import { degToRad, formatPiFraction, radToDeg } from '../../math/algorithms/angle.js'
import { SECTOR_ANGLE_LIMITS, useMathStore } from '../../store/useMathStore.js'
import ParamSlider from './ParamSlider.jsx'

/**
 * 圓心角滑桿：介面用「度」（1° 一格），store 與演算法用「弧度」。
 */
export default function AngleSlider() {
  const angle = useMathStore((state) => state.sector.centralAngle)
  const setSectorAngle = useMathStore((state) => state.setSectorAngle)

  const minDegrees = Math.round(radToDeg(SECTOR_ANGLE_LIMITS.min))
  const maxDegrees = Math.round(radToDeg(SECTOR_ANGLE_LIMITS.max))
  const degrees = Math.round(radToDeg(angle))
  const asPi = formatPiFraction(degrees)

  return (
    <ParamSlider
      label={
        <>
          圓心角 <var>θ</var>
        </>
      }
      value={degrees}
      min={minDegrees}
      max={maxDegrees}
      step={1}
      onChange={(value) => setSectorAngle(degToRad(Number(value)))}
      display={
        <>
          {degrees}°{asPi && <span className="slider__sub"> = {asPi}</span>}
        </>
      }
      valueText={`圓心角 ${degrees} 度`}
      scaleLabels={[`${minDegrees}°`, `${maxDegrees}°`]}
    />
  )
}
