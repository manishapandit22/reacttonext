import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from 'three'
// import fireVert from '../shaders/effects/fragment.glsl'
// import fireFrag from '../shaders/effects/vertex.glsl'

export const FireHitEffect = ({ position, active = false, color = "#ff4500" }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const timeRef = useRef(0);
  
  useEffect(() => {
    if (meshRef.current && !materialRef.current) {
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(color) },
          pulseSpeed: { value: 2.0 },
          noiseScale: { value: 5.0 },
          ringWidth: { value: 0.15 },
          opacity: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float time;
          uniform vec3 color;
          uniform float pulseSpeed;
          uniform float noiseScale;
          uniform float ringWidth;
          uniform float opacity;
          
          // Simplex noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
          
          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                               -0.577350269189626,  // -1.0 + 2.0 * C.x
                                0.024390243902439); // 1.0 / 41.0
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                  + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          
          void main() {
            // Calculate distance from center
            vec2 center = vUv - 0.5;
            float dist = length(center);
            
            // Create expanding ring effect
            float pulse = fract(time * pulseSpeed * 0.5);
            float expandingRing = 1.0 - smoothstep(pulse - ringWidth, pulse, dist) +
                                  smoothstep(pulse, pulse + ringWidth, dist);
            
            // Create noise for flame effect
            float noise1 = snoise((vUv + time * 0.1) * noiseScale);
            float noise2 = snoise((vUv * 2.0 - time * 0.2) * noiseScale);
            float noiseCombined = (noise1 + noise2) * 0.5;
            
            // Combine effects
            float brightness = expandingRing * (1.0 - dist * 2.0) * (0.8 + 0.4 * noiseCombined);
            
            // Create fiery color gradient
            vec3 baseColor = color;
            vec3 yellowColor = vec3(1.0, 0.9, 0.5);
            vec3 finalColor = mix(yellowColor, baseColor, dist * 2.0);
            
            // Apply noise distortion to edges
            float edgeIntensity = smoothstep(0.4, 0.5, dist) * snoise(vUv * 10.0 + time);
            finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), edgeIntensity * 0.3);
            
            // Apply opacity
            gl_FragColor = vec4(finalColor * brightness, brightness * opacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      materialRef.current = shaderMaterial;
      meshRef.current.material = shaderMaterial;
    }
  }, [color]);
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      timeRef.current += delta;
      materialRef.current.uniforms.time.value = timeRef.current;
      
      const targetOpacity = active ? 1.0 : 0.0;
      materialRef.current.uniforms.opacity.value += (targetOpacity - materialRef.current.uniforms.opacity.value) * 0.1;
    }
  });
  
  return (
    <group position={[position[0], position[1] + 0.5, position[2]]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
      </mesh>
    </group>
  );
};