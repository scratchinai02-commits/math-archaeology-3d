import { Grid } from '@react-three/drei'

export const SCENE_BACKGROUND = '#0e1719'

/**
 * 場景環境：背景色、霧、地面格線（1 單位一格，5 單位一大格）。
 * 格線略低於 y = 0，避免與落在 x-z 平面的數學圖形互相閃爍（z-fighting）。
 */
export default function Environment() {
  return (
    <>
      <color attach="background" args={[SCENE_BACKGROUND]} />
      <fog attach="fog" args={[SCENE_BACKGROUND, 30, 70]} />
      <Grid
        position={[0, -0.01, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#22383b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2f5257"
        fadeDistance={45}
        fadeStrength={1.2}
        infiniteGrid
      />
    </>
  )
}
