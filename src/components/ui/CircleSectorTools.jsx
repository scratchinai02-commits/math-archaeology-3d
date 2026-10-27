import { TAU } from '../../math/algorithms/angle.js'
import { circleArea, circleCircumference } from '../../math/geometry/circle.js'
import { arcLength, sectorArea } from '../../math/geometry/sector.js'
import { CIRCLE_SEGMENTS, useMathStore } from '../../store/useMathStore.js'
import AngleSlider from './AngleSlider.jsx'
import RadiusSlider from './RadiusSlider.jsx'

/**
 * 「圓與扇形」畫面的工具：半徑、圓心角與即時計算的數值。
 */
export default function CircleSectorTools() {
  const radius = useMathStore((state) => state.circle.radius)
  const angle = useMathStore((state) => state.sector.centralAngle)

  return (
    <>
      <h1 className="panel__title">
        圓與扇形 <span lang="en">Circle &amp; Sector</span>
      </h1>

      <p className="panel__formula">
        <span>
          <var>x</var> = <var>r</var> cos θ
        </span>
        <span>
          <var>z</var> = <var>r</var> sin θ
        </span>
        <span className="panel__formula-range">圓：0 ≤ θ ≤ 2π</span>
        <span className="panel__formula-range">扇形：0 ≤ θ ≤ 圓心角</span>
      </p>

      <section className="panel__section">
        <RadiusSlider />
        <dl className="readouts">
          <div>
            <dt>
              周長 <span className="readouts__eq">C = 2π<var>r</var></span>
            </dt>
            <dd>{circleCircumference(radius).toFixed(2)}</dd>
          </div>
          <div>
            <dt>
              面積 <span className="readouts__eq">A = π<var>r</var>²</span>
            </dt>
            <dd>{circleArea(radius).toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel__section">
        <AngleSlider />
        <dl className="readouts">
          <div>
            <dt>
              弧長 <span className="readouts__eq">s = <var>r</var>θ</span>
            </dt>
            <dd>{arcLength(radius, angle).toFixed(2)}</dd>
          </div>
          <div>
            <dt>
              扇形面積 <span className="readouts__eq">½<var>r</var>²θ</span>
            </dt>
            <dd>{sectorArea(radius, angle).toFixed(2)}</dd>
          </div>
          <div>
            <dt>
              占整圓 <span className="readouts__eq">θ / 2π</span>
            </dt>
            <dd>{((angle / TAU) * 100).toFixed(1)}%</dd>
          </div>
        </dl>
      </section>

      <p className="panel__note">圓周取樣 {CIRCLE_SEGMENTS + 1} 個頂點</p>
    </>
  )
}
