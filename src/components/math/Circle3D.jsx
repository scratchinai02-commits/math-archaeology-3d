import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { Html, Line } from '@react-three/drei'
import { createCirclePoints } from '../../math/geometry/circle.js'
import { createDiskMeshData } from '../../math/algorithms/meshData.js'
import { toBufferGeometry } from '../../math/algorithms/bufferGeometry.js'
import { CIRCLE_SEGMENTS, useMathStore } from '../../store/useMathStore.js'

const COLORS = {
  disk: '#6fc7bb',
  edge: '#f4efe6',
  radius: '#e39a2d',
}

const LINE_LIFT = 0.004

/**
 * 互動式 3D 圓。
 *
 *   radius（Zustand）→ createCirclePoints() → vertices / indices → BufferGeometry → Mesh
 *
 * 半徑改變時重新呼叫演算法計算頂點，絕不縮放 Mesh、圖片或外部模型。
 */
export default function Circle3D({ segments = CIRCLE_SEGMENTS }) {
  const radius = useMathStore((state) => state.circle.radius)

  const points = useMemo(() => createCirclePoints(radius, segments), [radius, segments])
  const diskGeometry = useMemo(() => toBufferGeometry(createDiskMeshData(points)), [points])

  // 舊的幾何資料不再使用時，釋放 GPU 記憶體
  useEffect(() => () => diskGeometry.dispose(), [diskGeometry])

  const center = [0, 0, 0]
  const edgePoint = points[0]

  return (
    <group>
      {/* 圓面：三角扇 BufferGeometry */}
      <mesh geometry={diskGeometry}>
        <meshStandardMaterial
          color={COLORS.disk}
          transparent
          opacity={0.24}
          side={DoubleSide}
          depthWrite={false}
          roughness={0.85}
        />
      </mesh>

      {/* 線條只在「繪製」時略高於平面，避免被半透明圓面蓋住；頂點資料本身仍在 y = 0 */}
      <group position={[0, LINE_LIFT, 0]}>
        {/* 圓周：同一組演算法頂點連成的折線 */}
        <Line points={points} color={COLORS.edge} lineWidth={2.5} />

        {/* 半徑：圓心 O 到 θ = 0 的頂點 */}
        <Line points={[center, edgePoint]} color={COLORS.radius} lineWidth={2} />
      </group>

      <Html position={[-0.35, 0, 0.35]} center pointerEvents="none" zIndexRange={[10, 0]}>
        <span className="scene-label scene-label--point">O</span>
      </Html>

      <Html position={[radius / 2, 0, 0]} center pointerEvents="none" zIndexRange={[10, 0]}>
        <span className="scene-label scene-label--radius">r = {radius.toFixed(1)}</span>
      </Html>
    </group>
  )
}
