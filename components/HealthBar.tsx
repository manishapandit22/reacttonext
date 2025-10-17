export const HealthBar = ({ position, health = 100 }) => {
  const barWidth = 0.8;
  const barHeight = 0.1;
  const healthPercentage = Math.max(0, Math.min(100, health)) / 100;

  return (
    <group position={[position[0], position[2] + 1, position[2]]}>
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[-(barWidth * (1 - healthPercentage)) / 2, 1, 0.01]}>
        <planeGeometry args={[barWidth * healthPercentage, barHeight]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
};