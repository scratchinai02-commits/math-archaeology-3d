import { circleArea, circleCircumference } from '../../math/geometry/circle.js'
import { CIRCLE_SEGMENTS, useMathStore } from '../../store/useMathStore.js'
import RadiusSlider from './RadiusSlider.jsx'

/**
 * 圓的說明與控制面板（HTML 疊在 Canvas 上方）。
 * 周長與面積同樣由數學函式即時計算。
 */
export default function CirclePanel() {
  const radius = useMathStore((state) => state.circle.radius)

  return (
    <aside className="panel" aria-label="圓的參數">
      <p className="panel__kicker">Math Archaeology 3D · 第一階段</p>
      <h1 className="panel__title">
        圓 <span lang="en">Circle</span>
      </h1>

      <p className="panel__formula">
        <span>
          <var>x</var> = <var>r</var> cos θ
        </span>
        <span>
          <var>z</var> = <var>r</var> sin θ
        </span>
        <span className="panel__formula-range">0 ≤ θ ≤ 2π</span>
      </p>

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
        <div>
          <dt>取樣頂點</dt>
          <dd>{CIRCLE_SEGMENTS + 1}</dd>
        </div>
      </dl>

      <p className="panel__hint">拖曳旋轉　滾輪縮放　右鍵平移</p>
    </aside>
  )
}
