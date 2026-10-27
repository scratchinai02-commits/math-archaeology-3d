import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { Html, Line } from '@react-three/drei'
import { radToDeg } from '../../math/algorithms/angle.js'
import { toBufferGeometry } from '../../math/algorithms/bufferGeometry.js'
import { createDiskMeshData } from '../../math/algorithms/meshData.js'
import {
  arcSegmentsFor,
  createSectorOutlinePoints,
  createSectorPoints,
} from '../../math/geometry/sector.js'
import { CIRCLE_SEGMENTS, useMathStore } from '../../store/useMathStore.js'

const COLORS = {
  fill: '#e39a2d',
  edge: '#f0b453',
  marker: '#f4efe6',
}

/** 只影響繪製順序的微小高度差；頂點資料本身都在 y = 0 */
const FILL_LIFT = 0.001
const LINE_LIFT = 0.005

/**
 * 互動式 3D 扇形（疊在 Circle3D 上）。
 *
 *   radius、centralAngle（Zustand）→ createSectorPoints() → 三角扇 → BufferGeometry
 *
 * 分段數依圓心角比例分配，與整圓的平滑度一致。
 */
export default function Sector3D() {
  const radius = useMathStore((state) => state.circle.radius)
  const startAngle = useMathStore((state) => state.sector.startAngle)
  const centralAngle = useMathStore((state) => state.sector.centralAngle)

  const endAngle = startAngle + centralAngle
  const segments = arcSegmentsFor(centralAngle, CIRCLE_SEGMENTS)

  const arc = useMemo(
    () => createSectorPoints(radius, startAngle, endAngle, segments),
    [radius, startAngle, endAngle, segments],
  )
  const outline = useMemo(() => createSectorOutlinePoints(arc), [arc])
  const geometry = useMemo(() => toBufferGeometry(createDiskMeshData(arc)), [arc])

  useEffect(() => () => geometry.dispose(), [geometry])

  // 圓心角的小弧記號與標籤
  const markerRadius = Math.min(1.2, radius * 0.3)
  const marker = useMemo(
    () => createSectorPoints(markerRadius, startAngle, endAngle, segments),
    [markerRadius, startAngle, endAngle, segments],
  )
  const midAngle = startAngle + centralAngle / 2
  const labelDistance = markerRadius + 0.6
  const degrees = Math.round(radToDeg(centralAngle))

  return (
    <group>
      <mesh geometry={geometry} position={[0, FILL_LIFT, 0]} renderOrder={1}>
        <meshStandardMaterial
          color={COLORS.fill}
          transparent
          opacity={0.38}
          side={DoubleSide}
          depthWrite={false}
          roughness={0.8}
        />
      </mesh>

      <group position={[0, LINE_LIFT, 0]}>
        <Line points={outline} color={COLORS.edge} lineWidth={2.5} />
        <Line points={marker} color={COLORS.marker} lineWidth={1.5} />
      </group>

      <Html
        position={[labelDistance * Math.cos(midAngle), 0, labelDistance * Math.sin(midAngle)]}
        center
        pointerEvents="none"
        zIndexRange={[10, 0]}
      >
        <span className="scene-label scene-label--angle">θ = {degrees}°</span>
      </Html>
    </group>
  )
}
