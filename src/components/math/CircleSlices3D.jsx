import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { Line } from '@react-three/drei'
import { toBufferGeometry } from '../../math/algorithms/bufferGeometry.js'
import { createDiskMeshData } from '../../math/algorithms/meshData.js'
import { createSectorOutlinePoints } from '../../math/geometry/sector.js'
import { createSliceArcPoints, sliceCircle } from '../../math/geometry/slices.js'
import { useMathStore } from '../../store/useMathStore.js'

export const SLICE_COLORS = Object.freeze(['#e39a2d', '#6fc7bb'])

/** 切開時每片往外推的距離，讓切痕看得見 */
const SLICE_GAP = 0.08
/** 只在繪製時略高於扇形面，避免外框被蓋住 */
const OUTLINE_LIFT = 0.004
/** 切片太多時外框會糊成一片，只在 32 片以內畫 */
const OUTLINE_MAX_COUNT = 32

/**
 * 把圓切成 n 片真正的扇形。
 *
 *   createSliceArcPoints() → 一片局部扇形（所有切片共用同一個 BufferGeometry）
 *   sliceCircle()          → 每片的 rotation / position
 *
 * 前半圈與後半圈用兩種顏色，之後重新排列時就是上下兩排。
 */
export default function CircleSlices3D() {
  const radius = useMathStore((state) => state.circle.radius)
  const count = useMathStore((state) => state.circle.slices)

  const arc = useMemo(() => createSliceArcPoints(radius, count), [radius, count])
  const geometry = useMemo(() => toBufferGeometry(createDiskMeshData(arc)), [arc])
  const outline = useMemo(() => createSectorOutlinePoints(arc), [arc])
  const slices = useMemo(() => sliceCircle(radius, count, { gap: SLICE_GAP }), [radius, count])

  useEffect(() => () => geometry.dispose(), [geometry])

  const showOutline = count <= OUTLINE_MAX_COUNT

  return (
    <group>
      {slices.map((slice) => (
        <group key={slice.index} position={slice.position} rotation-y={slice.rotation}>
          <mesh geometry={geometry}>
            <meshStandardMaterial
              color={SLICE_COLORS[slice.index < count / 2 ? 0 : 1]}
              side={DoubleSide}
              roughness={0.75}
            />
          </mesh>
          {showOutline && (
            <Line
              points={outline}
              position={[0, OUTLINE_LIFT, 0]}
              color="#0e1719"
              lineWidth={1}
            />
          )}
        </group>
      ))}
    </group>
  )
}
