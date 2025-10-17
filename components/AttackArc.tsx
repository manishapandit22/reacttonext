import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AttackArcProps {
  start: [number, number, number];
  end: [number, number, number];
  height?: number;
  color?: string;
  visible?: boolean;
  onComplete?: () => void;
  preview?: boolean;
  speed?: number;
  thickness?: number;
  opacity?: number;
}

const arcVertexShader = `
  attribute float arcProgress;
  varying float vArcProgress;
  void main() {
    vArcProgress = arcProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float baseOpacity;
  uniform float preview;
  varying float vArcProgress;
  void main() {
    float glow = 0.6 + 0.4 * sin(time * 3.5 + vArcProgress * 10.0);
    float head = smoothstep(0.0, 0.12, vArcProgress) * smoothstep(1.0, 0.88, vArcProgress);
    float blur = preview > 0.5 ? 0.6 : 1.0;
    float alpha = baseOpacity * glow * head * blur;
    gl_FragColor = vec4(color, alpha);
  }
`;

const HitEffect = ({ position, duration = 0.5, onDone }: { position: [number, number, number], duration?: number, onDone?: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [elapsed, setElapsed] = useState(0);
  useFrame((_, delta) => {
    setElapsed((e) => {
      const next = e + delta;
      if (next >= duration && onDone) onDone();
      return next;
    });
    if (meshRef.current) {
      const scale = 1 + 2 * (elapsed / duration);
      meshRef.current.scale.set(scale, scale, scale);
      (meshRef.current.material as any).opacity = 1 - elapsed / duration;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[0.1, 0.3, 32]} />
      <meshBasicMaterial color="#fff" transparent opacity={1} />
    </mesh>
  );
};

export const AttackArc = ({ 
  start, 
  end, 
  height = 2, 
  color = '#ff0000',
  visible = true,
  onComplete,
  preview = false,
  speed = 2,
  thickness = 2,
  opacity = 1
}: AttackArcProps) => {
  const points = useRef<THREE.Vector3[]>([]);
  const progressRef = useRef(0);
  const [showHit, setShowHit] = useState(false);
  const [hitKey, setHitKey] = useState(0);
  const arcRef = useRef<THREE.Line>(null);
  const [time, setTime] = useState(0);

  const { geometry, arcProgress } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
    mid.y += height;
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    const pts = curve.getPoints(50);
    points.current = pts;
    const arcProgress = new Float32Array(pts.length);
    for (let i = 0; i < pts.length; i++) arcProgress[i] = i / (pts.length - 1);
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    geometry.setAttribute('arcProgress', new THREE.BufferAttribute(arcProgress, 1));
    return { geometry, arcProgress };
  }, [start, end, height]);

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(color) },
      baseOpacity: { value: opacity },
      preview: { value: preview ? 1 : 0 },
    },
    vertexShader: arcVertexShader,
    fragmentShader: arcFragmentShader,
    transparent: true,
    depthWrite: false,
  }), [color, opacity, preview]);

  useFrame((_, delta) => {
    if (!visible) return;
    setTime((t) => t + delta);
    shaderMaterial.uniforms.time.value = time;
    shaderMaterial.uniforms.baseOpacity.value = opacity;
    shaderMaterial.uniforms.preview.value = preview ? 1 : 0;
    progressRef.current = Math.min(progressRef.current + delta * speed, 1);
    const count = Math.floor(points.current.length * progressRef.current);
    if (arcRef.current) {
      const posAttr = arcRef.current.geometry.getAttribute('position');
      for (let i = 0; i < posAttr.count; i++) {
        if (i < count) {
          posAttr.setXYZ(i, points.current[i].x, points.current[i].y, points.current[i].z);
        } else {
          const last = Math.max(0, count - 1);
          posAttr.setXYZ(i, points.current[last].x, points.current[last].y, points.current[last].z);
        }
      }
      posAttr.needsUpdate = true;
    }
    if (progressRef.current >= 1 && !showHit) {
      setShowHit(true);
      setHitKey((k) => k + 1);
      if (onComplete) onComplete();
    }
  });

  const impactPos = points.current.length > 0 ? [
    points.current[points.current.length - 1].x,
    points.current[points.current.length - 1].y,
    points.current[points.current.length - 1].z,
  ] as [number, number, number] : end;

  return visible ? (
    <>
      <line ref={arcRef} geometry={geometry} material={shaderMaterial} />
      {showHit && (
        <HitEffect key={hitKey} position={impactPos} onDone={() => setShowHit(false)} />
      )}
    </>
  ) : null;
}; ; 