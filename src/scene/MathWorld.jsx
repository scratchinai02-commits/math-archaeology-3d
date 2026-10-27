import { Canvas } from '@react-three/fiber'
import Circle3D from '../components/math/Circle3D.jsx'
import CoordinateSystem from '../components/math/CoordinateSystem.jsx'
import Sector3D from '../components/math/Sector3D.jsx'
import CameraRig from './CameraRig.jsx'
import Environment from './Environment.jsx'
import Lighting from './Lighting.jsx'

/**
 * R3F Canvas：整個 3D 數學世界的根。
 * 目前放座標系、Circle3D 與 Sector3D；之後由 world 狀態切換 GeometryIsland、FunctionValley…
 */
export default function MathWorld() {
  return (
    <Canvas className="math-world" dpr={[1, 2]} gl={{ antialias: true }}>
      <Environment />
      <Lighting />
      <CameraRig />
      <CoordinateSystem />
      <Circle3D />
      <Sector3D />
    </Canvas>
  )
}
