import { useMemo } from 'react'
import { Html, Line } from '@react-three/drei'
import { AXES, createCoordinateSystem, segmentsToLinePoints } from '../../math/geometry/axes.js'

export const AXIS_COLORS = Object.freeze({
  x: '#e0705a',
  y: '#8fcf6b',
  z: '#5aa8e0',
})

/** 線條只在繪製時略高於地面，避免被半透明圖形蓋住；數學座標本身不變 */
const AXIS_LIFT = 0.002

const formatTick = (value) => (value < 0 ? `−${-value}` : String(value))

/**
 * 座標系：軸線、刻度、箭頭全部來自 createCoordinateSystem() 算出的線段，
 * 不使用 THREE.AxesHelper 或任何現成模型。
 */
export default function CoordinateSystem() {
  const system = useMemo(() => createCoordinateSystem(), [])

  return (
    <group position={[0, AXIS_LIFT, 0]}>
      {AXES.map((axis) => {
        const { segment, ticks, arrow, labelPosition } = system[axis]
        const color = AXIS_COLORS[axis]
        const markPoints = segmentsToLinePoints([...ticks.map((tick) => tick.segment), ...arrow])

        return (
          <group key={axis}>
            <Line points={segment} color={color} lineWidth={1.5} />
            <Line points={markPoints} segments color={color} lineWidth={1.25} />

            <Html position={labelPosition} center pointerEvents="none" zIndexRange={[10, 0]}>
              <span className="scene-label axis-label" style={{ color }}>
                {axis}
              </span>
            </Html>

            {ticks
              .filter((tick) => tick.major)
              .map((tick) => (
                <Html
                  key={tick.value}
                  position={tick.labelPosition}
                  center
                  pointerEvents="none"
                  zIndexRange={[10, 0]}
                >
                  <span className="tick-label">{formatTick(tick.value)}</span>
                </Html>
              ))}
          </group>
        )
      })}
    </group>
  )
}
