import { useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

const BASE_POSITION = [9, 10, 13]

/**
 * 依畫面長寬比決定初始視角。
 * 透視相機固定的是「垂直」視角，直式手機畫面左右會被裁掉，
 * 所以窄螢幕時把相機往後拉，並讓目標點略往前，避開底部面板。
 */
function initialView(aspect) {
  const portrait = aspect < 1
  const distanceScale = portrait ? Math.min(2.2, Math.max(1, 0.8 / aspect)) : 1
  const target = portrait ? [0, 0, 2] : [0, 0, 0]

  return {
    target,
    position: BASE_POSITION.map((v, i) => target[i] + v * distanceScale),
  }
}

/**
 * 相機與軌道控制：斜上方俯視 x-z 平面；半徑最大 10 時整個圓仍在畫面內。
 * 初始視角只在載入時計算一次，之後不打斷使用者的旋轉與縮放。
 */
export default function CameraRig() {
  const size = useThree((state) => state.size)
  const [view] = useState(() => initialView(size.width / size.height))

  return (
    <>
      <PerspectiveCamera makeDefault position={view.position} fov={45} near={0.1} far={200} />
      <OrbitControls
        makeDefault
        target={view.target}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.495}
      />
    </>
  )
}
