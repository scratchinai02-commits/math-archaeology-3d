import { rearrangedDimensions } from '../../math/geometry/slices.js'
import { useMathStore } from '../../store/useMathStore.js'
import RadiusSlider from './RadiusSlider.jsx'
import RearrangeControl from './RearrangeControl.jsx'
import SliceCountPicker from './SliceCountPicker.jsx'

/**
 * 「切片」畫面的工具：半徑、切片數、重新排列，以及排列後的尺寸。
 * 每個數值旁邊的「→」是 n → ∞ 時的極限。
 */
export default function SliceTools() {
  const radius = useMathStore((state) => state.circle.radius)
  const count = useMathStore((state) => state.circle.slices)
  const d = rearrangedDimensions(radius, count)
  const error = ((d.limitArea - d.area) / d.limitArea) * 100

  return (
    <>
      <h1 className="panel__title">
        切開圓 <span lang="en">Circle Slices</span>
      </h1>

      <p className="panel__formula">
        <span>
          每片圓心角 α = 2π / <var>n</var> = π/{count / 2}
        </span>
        <span className="panel__formula-range">▲▼ 交錯排成一列</span>
      </p>

      <section className="panel__section">
        <RadiusSlider />
        <SliceCountPicker />
        <RearrangeControl />
      </section>

      <section className="panel__section">
        <dl className="readouts">
          <div>
            <dt>
              底 <span className="readouts__eq">(<var>n</var>/2)·2<var>r</var> sin(π/<var>n</var>)</span>
            </dt>
            <dd>
              {d.base.toFixed(3)}
              <small className="readouts__limit">→ π<var>r</var> = {d.limitBase.toFixed(3)}</small>
            </dd>
          </div>
          <div>
            <dt>
              高 <span className="readouts__eq"><var>r</var> cos(π/<var>n</var>)</span>
            </dt>
            <dd>
              {d.height.toFixed(3)}
              <small className="readouts__limit">→ <var>r</var> = {d.limitHeight.toFixed(3)}</small>
            </dd>
          </div>
          <div>
            <dt>
              面積 <span className="readouts__eq">底 × 高</span>
            </dt>
            <dd>
              {d.area.toFixed(3)}
              <small className="readouts__limit">→ π<var>r</var>² = {d.limitArea.toFixed(3)}</small>
            </dd>
          </div>
          <div>
            <dt>與 π<var>r</var>² 相差</dt>
            <dd>{error < 0.01 ? error.toFixed(4) : error.toFixed(2)}%</dd>
          </div>
        </dl>
      </section>
    </>
  )
}
