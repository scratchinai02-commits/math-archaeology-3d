import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, MathUtils } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { toBufferGeometry } from '../../math/algorithms/bufferGeometry.js'
import { easeInOutCubic } from '../../math/algorithms/easing.js'
import { createDiskMeshData } from '../../math/algorithms/meshData.js'
import { lerpTransform } from '../../math/algorithms/transform.js'
import { createSectorOutlinePoints } from '../../math/geometry/sector.js'
import {
  createReferenceRectangle,
  createSliceArcPoints,
  createSliceLayout,
} from '../../math/geometry/slices.js'
import { useMathStore } from '../../store/useMathStore.js'

export const SLICE_COLORS = Object.freeze(['#e39a2d', '#6fc7bb'])

/** 切開時每片往外推的距離，讓切痕看得見 */
const SLICE_GAP = 0.08
/** 只在繪製時略高於扇形面，避免外框被蓋住 */
const OUTLINE_LIFT = 0.004
const RECTANGLE_LIFT = 0.008
/** 切片太多時外框會糊成一片，只在 32 片以內畫 */
const OUTLINE_MAX_COUNT = 32
/** 動畫追上目標的速度（越大越快） */
const DAMPING = 4

/**
 * 把圓切成 n 片真正的扇形，並可交錯重新排列成近似長方形。
 *
 *   createSliceArcPoints() → 一片局部扇形（所有切片共用同一個 BufferGeometry）
 *   createSliceLayout()    → 每片從「圓上」到「排成一列」的變換
 *   lerpTransform()        → 依進度內插，每一幀直接更新 group，不經過 React 重繪
 *
 * 前半圈、後半圈兩色，排列後就是上下兩排。
 */
export default function CircleSlices3D() {
  const radius = useMathStore((state) => state.circle.radius)
  const count = useMathStore((state) => state.circle.slices)
  const fullyArranged = useMathStore((state) => state.slicing.rearrange === 1)

  const arc = useMemo(() => createSliceArcPoints(radius, count), [radius, count])
  const geometry = useMemo(() => toBufferGeometry(createDiskMeshData(arc)), [arc])
  const outline = useMemo(() => createSectorOutlinePoints(arc), [arc])
  const layout = useMemo(() => createSliceLayout(radius, count, { gap: SLICE_GAP }), [radius, count])
  const rectangle = useMemo(() => createReferenceRectangle(radius), [radius])

  useEffect(() => () => geometry.dispose(), [geometry])

  const groups = useRef([])
  const progress = useRef(useMathStore.getState().slicing.rearrange)
  const lift = radius * 0.3

  useFrame((_, delta) => {
    const target = useMathStore.getState().slicing.rearrange
    progress.current =
      Math.abs(target - progress.current) < 1e-4
        ? target
        : MathUtils.damp(progress.current, target, DAMPING, delta)

    const t = easeInOutCubic(progress.current)

    for (let i = 0; i < layout.length; i++) {
      const group = groups.current[i]
      if (!group) continue
      const { position, rotation } = lerpTransform(layout[i].from, layout[i].to, t, { lift })
      group.position.set(position[0], position[1], position[2])
      group.rotation.y = rotation
    }
  })

  const showOutline = count <= OUTLINE_MAX_COUNT
  const initialT = easeInOutCubic(progress.current)

  return (
    <group>
      {layout.map((slice, i) => {
        const initial = lerpTransform(slice.from, slice.to, initialT, { lift })
        return (
          <group
            key={slice.index}
            ref={(element) => {
              groups.current[i] = element
            }}
            position={initial.position}
            rotation-y={initial.rotation}
          >
            <mesh geometry={geometry}>
              <meshStandardMaterial color={SLICE_COLORS[slice.row]} side={DoubleSide} roughness={0.75} />
            </mesh>
            {showOutline && (
              <Line points={outline} position={[0, OUTLINE_LIFT, 0]} color="#0e1719" lineWidth={1} />
            )}
          </group>
        )
      })}

      {fullyArranged && (
        <group position={[0, RECTANGLE_LIFT, 0]}>
          <Line
            points={rectangle}
            color="#f4efe6"
            lineWidth={1.5}
            dashed
            dashSize={0.25}
            gapSize={0.18}
          />
          <Html position={[0, 0, radius / 2 + 0.7]} center pointerEvents="none" zIndexRange={[10, 0]}>
            <span className="scene-label scene-label--measure">底 ≈ πr</span>
          </Html>
          <Html
            position={[(Math.PI * radius) / 2 + 0.9, 0, 0]}
            center
            pointerEvents="none"
            zIndexRange={[10, 0]}
          >
            <span className="scene-label scene-label--measure">高 ≈ r</span>
          </Html>
        </group>
      )}
    </group>
  )
}
