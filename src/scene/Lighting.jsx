/**
 * 場景燈光：天空/地面半球光 + 環境光 + 一盞主光。
 */
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#dfe9e6', '#1a2426', 0.6]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 12, 8]} intensity={1.2} />
    </>
  )
}
