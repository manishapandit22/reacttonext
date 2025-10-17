import { Text } from "@react-three/drei";

export const CharacterNameDisplay = ({ name }) => {
  return (
    <group position={[0, 2.1, 0]} >
      <Text
        position={[0, 0, 0]}
        // rotation={[0, 0, Math.PI]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        font="/fonts/pixel.ttf"
      >
        {name}
      </Text>
      
      <mesh position={[0, 0, -0.01]} rotation={[0, 0, 0]}>
        <planeGeometry args={[name.length * 0.07 + 0.1, 0.15]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};