import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FireHitEffect } from "./FireEffect";
import { HealthBar } from "./HealthBar";
import { CharacterNameDisplay } from "./CharacterDisplay";
import { CharacterSpeech, useSpeech } from "./CharacterSpeech";

interface GamePieceProps {
  modelPath: string;
  name: string;
  position: [number, number, number];
  gridPosition: [number, number];
  onSelect?: (gridPos: [number, number]) => void;
  isSelected?: boolean;
  targetPosition?: [number, number, number] | null;
  targetWorldPosition?: [number, number, number] | null; // Add this for enemy AI movement
  onMove?: (from: [number, number], to: [number, number]) => void;
  characterState?: string;
  isAttackTarget?: boolean;
  speechText?: string;
  voiceURI?: string | null;
  onSpeakRequest?: (name: string) => void;
  health?: number;
  maxHealth?: number;
}

const useGLTFWithDraco = (modelPath: string) => {
  const [gltfData, setGltfData] = useState<any>({ scene: null, animations: [], mixer: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);

        const gltfLoader = new GLTFLoader();
        
        const dracoLoader = new DRACOLoader();
        
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        
        dracoLoader.setDecoderConfig({ type: 'js' });
        dracoLoader.preload();
        
        gltfLoader.setDRACOLoader(dracoLoader);

        const gltf: any = await new Promise((resolve, reject) => {
          gltfLoader.load(
            modelPath,
            resolve,
            undefined,
            reject
          );
        });

        let mixer = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(gltf.scene);
        }

        setGltfData({
          scene: gltf.scene,
          animations: gltf.animations || [],
          mixer: mixer
        });

        dracoLoader.dispose();
        
      } catch (err) {
        console.error('Error loading GLTF model:', err);
        setError(err);
        
        try {
          const fallbackData = useGLTF(modelPath);
          setGltfData({
            scene: fallbackData.scene,
            animations: fallbackData.animations || [],
            mixer: null
          });
        } catch (fallbackErr) {
          console.error('Fallback loading also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (modelPath) {
      loadModel();
    }
  }, [modelPath]);

  return { ...gltfData, loading, error };
};

export const GamePiece = ({
  modelPath,
  name,
  position,
  gridPosition,
  onSelect,
  isSelected,
  targetPosition = null,
  targetWorldPosition = null, 
  onMove,
  characterState,
  isAttackTarget,
  speechText = "",
  voiceURI = null,
  onSpeakRequest,
  health = 100,
  maxHealth = 100
}: GamePieceProps) => {
  const group = useRef<THREE.Group>(null);
  
  const { scene, animations, mixer: customMixer, loading, error } = useGLTFWithDraco(modelPath);
  
  const [currentPos, setCurrentPos] = useState<[number, number, number]>(position);
  const [actions, setActions] = useState<Record<string, THREE.AnimationAction>>({});
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [boundingBox, setBoundingBox] = useState<{
    box: THREE.Box3;
    size: THREE.Vector3;
    center: THREE.Vector3;
    calculatedScale: number;
  } | null>(null);
  const [showSpeech, setShowSpeech] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  
  const initialYPosition = useRef<number>(position[1]);

  const { speak } = useSpeech();

  const effectiveTargetPosition = targetWorldPosition || targetPosition;
  const isEnemyMove = !!targetWorldPosition && !targetPosition;
  const isPlayerMove = !!targetPosition && !targetWorldPosition;

  useEffect(() => {
    if (customMixer && animations && animations.length > 0) {
      setMixer(customMixer);
      
      const newActions: Record<string, THREE.AnimationAction> = {};
      
      animations.forEach((clip: THREE.AnimationClip) => {
        const action = customMixer.clipAction(clip);
        newActions[clip.name] = action;
        console.log(`Clip: ${clip.name}, duration: ${clip.duration}, tracks: ${clip.tracks.length}`);
      });
      
      setActions(newActions);
      console.log(`Available animations for ${modelPath}:`, Object.keys(newActions));
    }
  }, [customMixer, animations, modelPath]);

  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (effectiveTargetPosition && group.current) {
      const targetWorldPos = effectiveTargetPosition;

      const lerpFactor = 0.1;
      const newPos = {
        x: THREE.MathUtils.lerp(
          group.current.position.x,
          targetWorldPos[0],
          lerpFactor
        ),
        y: initialYPosition.current,
        z: THREE.MathUtils.lerp(
          group.current.position.z,
          targetWorldPos[2],
          lerpFactor
        ),
      };

      group.current.position.set(newPos.x, newPos.y, newPos.z);

      const distanceSquared =
        Math.pow(newPos.x - targetWorldPos[0], 2) +
        Math.pow(newPos.z - targetWorldPos[2], 2);

      if (distanceSquared < 0.01) {
        group.current.position.set(
          targetWorldPos[0],
          targetWorldPos[1],
          targetWorldPos[2]
        );
        setCurrentPos(targetWorldPos);
        
        if (onMove && isPlayerMove) {
          onMove(gridPosition, [targetPosition[0], targetPosition[1]]);
        }

      }
    }

    if (effectiveTargetPosition && group.current) {
      const dx = effectiveTargetPosition[0] - currentPos[0];
      const dz = effectiveTargetPosition[2] - currentPos[2];
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        const angle = Math.atan2(dx, dz);
        group.current.rotation.y = angle;
      }
    }
  });

  useEffect(() => {
    if (scene && !loading) {
      const clonedScene = scene.clone();
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMapIntensity = 0.7; 
        }
      });

      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDimension = Math.max(size.x, size.y, size.z);
      const desiredSize = 0.8;
      const calculatedScale = desiredSize / maxDimension;

      setBoundingBox({ box, size, center, calculatedScale });

      if (group.current) {
        const yPos = -center.y * calculatedScale + desiredSize / 2.5;
        group.current.position.y = yPos;
        initialYPosition.current = yPos;
        group.current.scale.set(
          calculatedScale,
          calculatedScale,
          calculatedScale
        );
      }
    }
  }, [scene, position, loading]);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    Object.values(actions).forEach((action) => {
      if (action) {
        action.stop();
        action.reset();
      }
    });

    let currentAction = null;

    if (isSelected) {
      if (characterState === "attack" || characterState === "RANGED") {
        const attackAction = actions["attack"];
        if (attackAction) {
          attackAction.reset();
          attackAction.setLoop(THREE.LoopOnce, 1);
          attackAction.clampWhenFinished = true;
          attackAction.play();
          currentAction = attackAction;
        }
      } else if (characterState === "idle" || characterState === "MOVING") {
        const idleAction = actions["idle"];
        if (idleAction) {
          idleAction.reset();
          idleAction.setLoop(THREE.LoopRepeat);
          idleAction.play();
          currentAction = idleAction;
        }
      } else if (characterState === "SPEAKING") {
        const speakAction = actions["talk"] || actions["speak"] || actions["Talk"] || actions["Speak"] || actions["Armature|Talk"];
        if (speakAction) {
          console.log(`✅ Found speak animation: ${speakAction._clip.name}`);
          speakAction.reset();
          speakAction.setLoop(THREE.LoopRepeat);
          speakAction.play();
          
          if (speechText) {
            speak(speechText, voiceURI);
            setShowSpeech(true);
            
            setTimeout(() => {
              setShowSpeech(false);
            }, 4000);
          }
        } else {
          const idleAction = actions["idle"] || actions["Idle"] || actions["IdleAction"] || actions["Armature|Idle"];
          if (idleAction) {
            idleAction.reset().play();
          }
        }
      }
    } else {
      const idleAction = actions["idle"];
      if (idleAction) {
        idleAction.reset();
        idleAction.setLoop(THREE.LoopRepeat);
        idleAction.play();
        currentAction = idleAction;
      }
    }

    const handleAnimationFinished = (event) => {
      if (event.action === currentAction && (characterState === "attack" || characterState === "RANGED")) {
        const idleAction = actions["idle"];
        if (idleAction) {
          idleAction.reset();
          idleAction.setLoop(THREE.LoopRepeat);
          idleAction.play();
        }
      }
    };

    if (mixer && currentAction) {
      mixer.addEventListener("finished", handleAnimationFinished);
    }

    return () => {
      if (mixer && currentAction) {
        mixer.removeEventListener("finished", handleAnimationFinished);
      }
    };
  }, [actions, characterState, isSelected, mixer, speak, speechText, voiceURI, name]);

  useEffect(() => {
    if (characterState === "SPEAKING" && isSelected && speechText) {
      console.log(`Character ${name} is speaking: "${speechText}"`);
      setShowSpeech(true);
      
      const timer = setTimeout(() => {
        setShowSpeech(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [characterState, isSelected, name, speechText]);

  const handleSpeak = () => {
    if (speechText) {
      console.log(`Character ${name} speaks: "${speechText}"`);
      // speak(speechText, voiceURI);
      setShowSpeech(true);
      
      setTimeout(() => {
        setShowSpeech(false);
      }, 4000);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    const isEnemyPiece = modelPath.includes("enemy") || name.includes("enemy") || name.includes("tula");
    if (isEnemyPiece) {
      console.log(`Cannot select enemy piece: ${name}`);
      return;
    }
    
    if (onSelect) {
      onSelect(gridPosition);
    }
    
    handleSpeak();
    
    if (onSpeakRequest) {
      onSpeakRequest(name);
    }
  };

  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (targetPosition && group.current) {
      const targetWorldPos = [
        targetPosition[0],
        initialYPosition.current,
        targetPosition[2],
      ];

      const lerpFactor = 0.1;
      const newPos = {
        x: THREE.MathUtils.lerp(
          group.current.position.x,
          targetWorldPos[0],
          lerpFactor
        ),
        y: initialYPosition.current,
        z: THREE.MathUtils.lerp(
          group.current.position.z,
          targetWorldPos[2],
          lerpFactor
        ),
      };

      group.current.position.set(newPos.x, newPos.y, newPos.z);

      const distanceSquared =
        Math.pow(newPos.x - targetWorldPos[0], 2) +
        Math.pow(newPos.z - targetWorldPos[2], 2);

      if (distanceSquared < 0.01) {
        group.current.position.set(
          targetWorldPos[0],
          targetWorldPos[1],
          targetWorldPos[2]
        );
        setCurrentPos(targetWorldPos);
        onMove(gridPosition, targetPosition);
      }
    }

    if (targetPosition && group.current) {
      const dx = targetPosition[0] - currentPos[0];
      const dz = targetPosition[2] - currentPos[2];
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        const angle = Math.atan2(dx, dz);
        group.current.rotation.y = angle;
      }
    }
  });

  if (loading) {
    return (
      <group position={currentPos}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="gray" wireframe />
        </mesh>
      </group>
    );
  }

  if (error) {
    console.error(`Failed to load model: ${modelPath}`, error);
    return (
      <group position={currentPos}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    );
  }

  if (!scene) {
    return null;
  }

  const effectColor = modelPath.includes("enemy") ? "#ff2200" : "#00aaff";
  
  const bubbleHeight = boundingBox 
    ? boundingBox.size.y * boundingBox.calculatedScale + 0.5 
    : 1.5;

  return (
    <group
      ref={group}
      position={currentPos}
      onClick={handleClick} 
    >
      <primitive object={scene} />
      <spotLight
        position={[0, 2, -1]}
        intensity={0.5}
        color="#f0f0f0"
        distance={3}
        angle={0.3}
        penumbra={0.5}
        decay={2}
      />
      
      <FireHitEffect position={[0, 0, 0]} active={isAttackTarget} color={effectColor} />
      
      <HealthBar position={[0, 0, 0]} health={health} />
      
      <CharacterNameDisplay name={name} />
      
      {showSpeech && speechText && (
        <CharacterSpeech 
          text={speechText} 
          name={name} 
          position={[0, bubbleHeight, 0]} 
        />
      )}
      
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};