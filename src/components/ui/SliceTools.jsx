import { circleArea } from '../../math/geometry/circle.js'
import { useMathStore } from '../../store/useMathStore.js'
import RadiusSlider from './RadiusSlider.jsx'
import SliceCountPicker from './SliceCountPicker.jsx'

/**
 * 「切片」畫面的工具：半徑、切片數與每片的數值。
 */
export default function SliceTools() {
  const radius = useMathStore((state) => state.circle.radius)
  const count = useMathStore((state) => state.circle.slices)

  return (
    <>
      <h1 className="panel__title">
        切開圓 <span lang="en">Circle Slices</span>
      </h1>

      <p className="panel__formula">
        <span>
          每片圓心角 α = 2π / <var>n</var>
        </span>
        <span className="panel__formula-range">每一片都是演算法算出的真扇形</span>
      </p>

      <section className="panel__section">
        <RadiusSlider />
        <SliceCountPicker />
        <dl className="readouts">
          <div>
            <dt>
              每片圓心角 <span className="readouts__eq">2π / <var>n</var></span>
            </dt>
            <dd>π/{count / 2}</dd>
          </div>
          <div>
            <dt>
              每片面積 <span className="readouts__eq">π<var>r</var>² / <var>n</var></span>
            </dt>
            <dd>{(circleArea(radius) / count).toFixed(3)}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}
