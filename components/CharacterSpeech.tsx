import React from "react";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  
  const speak = React.useCallback((text, voice = null) => {
    if (!text || typeof window === 'undefined') return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
    
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, []);
  
  return { speak, isSpeaking };
};

export const CharacterSpeech = ({ text, name, position = [0, 1.5, 0] }) => {
  const bubbleRef = React.useRef();
  
  React.useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scale.set(0.01, 0.01, 0.01);
      
      const timer = setTimeout(() => {
        if (bubbleRef.current) {
          bubbleRef.current.scale.set(1, 1, 1);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <group position={position} ref={bubbleRef}>
      <group>
        <mesh position={[0, 0.8, 0]}>
          <customRoundedBoxGeometry args={[1.8, 0.7, 0.05, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
        
        <mesh position={[0, 0.8, -0.01]}>
          <customRoundedBoxGeometry args={[1.85, 0.75, 0.01, 0.1, 4]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>
        
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      </group>
      
      <Text
        position={[0, 0.8, 0.03]}
        fontSize={0.11}
        color="#000000"
        maxWidth={1.6}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </group>
  );
};

class CustomRoundedBoxGeometry extends THREE.BufferGeometry {
  constructor(width = 1, height = 1, depth = 1, radius = 0.1, smoothness = 4) {
    super();
    
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const w = width - radius * 2;
    const h = height - radius * 2;
    
    shape.moveTo(-w/2, -h/2 + radius);
    shape.lineTo(-w/2, h/2 - radius);
    shape.absarc(-w/2 + radius, h/2 - radius, radius, Math.PI, Math.PI / 2, true);
    shape.lineTo(w/2 - radius, h/2);
    shape.absarc(w/2 - radius, h/2 - radius, radius, Math.PI / 2, 0, true);
    shape.lineTo(w/2, -h/2 + radius);
    shape.absarc(w/2 - radius, -h/2 + radius, radius, 0, -Math.PI / 2, true);
    shape.lineTo(-w/2 + radius, -h/2);
    shape.absarc(-w/2 + radius, -h/2 + radius, radius, -Math.PI / 2, -Math.PI, true);
    
    const extrudeSettings = {
      depth: depth - radius * 2,
      bevelEnabled: true,
      bevelSegments: smoothness,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius,
      curveSegments: smoothness * 2
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    
    this.copy(geometry);
  }
}

extend({ CustomRoundedBoxGeometry });

export const triggerCharacterSpeech = (characterId, text, voiceURI = null) => {
  const { speak } = useSpeech();
  speak(text, voiceURI);
};