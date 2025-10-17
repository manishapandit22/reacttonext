import * as THREE from 'three'

interface HighlightCellProps {
  position: [number, number, number];
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  color?: string;
  opacity?: number;
}

export const HighlightCell = ({ 
  position, 
  onClick, 
  onPointerOver, 
  onPointerOut, 
  color = "green",
  opacity = 0.8
}: HighlightCellProps) => {
  return (
    <mesh
      position={[position[0], 0.01, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};