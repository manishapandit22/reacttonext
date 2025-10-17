import { Grid } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three'
import { GamePiece } from "./GamePiece";
import { HighlightCell } from "./HighlightCell";
import vertexShader from "../shaders/gameBoard/board.vert";
import fragmentShader from "../shaders/gameBoard/board.frag";

interface GameBoardProps {
  boardSize?: number;
  cellSize?: number;
  selectedPiece?: [number, number] | null;
  highlightedCells: [number, number][];
  gamePieces: any[];
  onPieceSelect: (piece: any) => void;
  onPieceMove: (piece: any, position: [number, number]) => void;
  characterState?: any;
  attackTargetId?: string | null;
  navigationMatrix?: number[][];
  onCharacterSpeak?: (text: string) => void;
  heightScale?: number;
  boardImage?: string;
  boardTextures?: any;
  rangedTargets?: [number, number][];
  onRangedHover?: (gridPos: [number, number] | null) => void;
  onRangedSelect?: (gridPos: [number, number]) => void;
}

export const GameBoard = ({
  boardSize = 20,
  cellSize = 1,
  selectedPiece,
  highlightedCells,
  gamePieces,
  onPieceSelect,
  onPieceMove,
  characterState,
  attackTargetId,
  navigationMatrix,
  onCharacterSpeak,
  heightScale = 0.3,
  boardImage,
  boardTextures = {},
  rangedTargets = [],
  onRangedHover,
  onRangedSelect,
}: GameBoardProps) => {
  const groundRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  
  const updateCameraPosition = (camera: THREE.Camera) => {
    if (materialRef.current) {
      materialRef.current.uniforms.cameraPosition.value = camera.position;
    }
  };

  useEffect(() => {
    if (materialRef.current && materialRef.current.uniforms) {
      if (materialRef.current.uniforms.heightScale) materialRef.current.uniforms.heightScale.value = heightScale;
      if (materialRef.current.uniforms.normalStrength) materialRef.current.uniforms.normalStrength.value = 1.0;
      if (materialRef.current.uniforms.lightPosition) materialRef.current.uniforms.lightPosition.value = new THREE.Vector3(20, 25, 20);
      if (materialRef.current.uniforms.lightColor) materialRef.current.uniforms.lightColor.value = new THREE.Vector3(1.0, 0.98, 0.95);
      if (materialRef.current.uniforms.roughness) materialRef.current.uniforms.roughness.value = 0.6;
      if (materialRef.current.uniforms.metalness) materialRef.current.uniforms.metalness.value = 0.05;
      if (materialRef.current.uniforms.cameraPosition) materialRef.current.uniforms.cameraPosition.value = new THREE.Vector3(0, 0, 0);
    }
  }, [heightScale]);

  useFrame(() => {
    if (materialRef.current && materialRef.current.uniforms.cameraPosition) {
      materialRef.current.uniforms.cameraPosition.value = camera.position;
    }
  });

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    let baseTexture = null;
    let heightTexture = null;
    let normalTexture = null;

    const baseImageUrl = boardImage || "/map.png";
    textureLoader.load(baseImageUrl, (loadedTexture) => {
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTexture.magFilter = THREE.LinearFilter;
      loadedTexture.anisotropy = 16;
      baseTexture = loadedTexture;
      updateMaterial();
    }, undefined, (error) => {
      console.warn('Failed to load base texture:', error);
      textureLoader.load("/map.png", (fallbackTexture) => {
        fallbackTexture.wrapS = THREE.RepeatWrapping;
        fallbackTexture.wrapT = THREE.RepeatWrapping;
        fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
        fallbackTexture.magFilter = THREE.LinearFilter;
        fallbackTexture.anisotropy = 16;
        baseTexture = fallbackTexture;
        updateMaterial();
      });
    });

    const heightMapUrl = (boardTextures as any).heightTexture?.image?.src || "/height_map_generated.png";
    textureLoader.load(heightMapUrl, (loadedHeightMap) => {
      loadedHeightMap.wrapS = THREE.ClampToEdgeWrapping;
      loadedHeightMap.wrapT = THREE.ClampToEdgeWrapping;
      loadedHeightMap.minFilter = THREE.LinearFilter;
      loadedHeightMap.magFilter = THREE.LinearFilter;
      heightTexture = loadedHeightMap;
      updateMaterial();
    }, undefined, (error) => {
      console.warn('Failed to load height map:', error);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 256, 256);
      const defaultHeightTexture = new THREE.CanvasTexture(canvas);
      heightTexture = defaultHeightTexture;
      updateMaterial();
    });

    const normalMapUrl = (boardTextures as any).normalTexture?.image?.src || "/normal_map.png";
    textureLoader.load(normalMapUrl, (loadedNormalMap) => {
      loadedNormalMap.wrapS = THREE.RepeatWrapping;
      loadedNormalMap.wrapT = THREE.RepeatWrapping;
      loadedNormalMap.minFilter = THREE.LinearMipmapLinearFilter;
      loadedNormalMap.magFilter = THREE.LinearFilter;
      loadedNormalMap.anisotropy = 16;
      normalTexture = loadedNormalMap;
      updateMaterial();
    }, undefined, (error) => {
      console.warn('Failed to load normal map:', error);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#8080FF';
      ctx.fillRect(0, 0, 256, 256);
      const defaultNormalTexture = new THREE.CanvasTexture(canvas);
      normalTexture = defaultNormalTexture;
      updateMaterial();
    });

    const updateMaterial = () => {
      if (materialRef.current && materialRef.current.uniforms && baseTexture && heightTexture && normalTexture) {
        if (materialRef.current.uniforms.map) materialRef.current.uniforms.map.value = baseTexture;
        if (materialRef.current.uniforms.heightMap) materialRef.current.uniforms.heightMap.value = heightTexture;
        if (materialRef.current.uniforms.normalMap) materialRef.current.uniforms.normalMap.value = normalTexture;
        if (materialRef.current.uniforms.heightScale) materialRef.current.uniforms.heightScale.value = heightScale;
        
        materialRef.current.needsUpdate = true;
      }
    };

  }, [heightScale, boardImage, boardTextures]);


  useEffect(() => {
    if (groundRef.current) {
      const segments = Math.max(32, boardSize * 2);
      const newGeometry = new THREE.PlaneGeometry(
        boardSize * cellSize,
        boardSize * cellSize,
        segments,
        segments
      );

      groundRef.current.geometry.dispose();
      groundRef.current.geometry = newGeometry;
    }
  }, [boardSize, cellSize]);

  const handleCellClick = (gridPos: [number, number]) => {
    if (
      selectedPiece &&
      highlightedCells.some(
        (cell) => cell[0] === gridPos[0] && cell[1] === gridPos[1]
      )
    ) {
      onPieceMove(selectedPiece, gridPos);
    }
  };

  const centerOffset = (boardSize - 1) / 2;

  return (
    <group>
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[
          boardSize * cellSize,
          boardSize * cellSize,
          Math.max(32, boardSize * 2),
          Math.max(32, boardSize * 2)
        ]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            map: { value: null },
            heightMap: { value: null },
            normalMap: { value: null },
            heightScale: { value: heightScale },
            normalStrength: { value: 1.0 },
            lightPosition: { value: new THREE.Vector3(20, 25, 20) },
            lightColor: { value: new THREE.Vector3(1.0, 0.98, 0.95) },
            roughness: { value: 0.6 },
            metalness: { value: 0.05 },
            cameraPosition: { value: new THREE.Vector3(0, 0, 0) }
          }}
        />
      </mesh>

      <Grid
        infiniteGrid={false}
        cellSize={cellSize}
        cellThickness={1.0}
        cellColor="#1a1a1a"
        sectionSize={boardSize}
        sectionThickness={1.5}
        sectionColor="#4a1a1a"
        fadeDistance={boardSize * cellSize * 1.5}
        fadeStrength={1}
        position={[0, -0.005, 0]}
        args={[boardSize * cellSize, boardSize * cellSize]}
      />

      {gamePieces.map((piece, index) => {
        const worldPos = [
          (piece.gridPosition[0] - centerOffset) * cellSize,
          piece.elevation,
          (piece.gridPosition[1] - centerOffset) * cellSize
        ];
        
        const targetWorldPos = piece.targetWorldPosition || (piece.targetPosition ? [
          (piece.targetPosition[0] - centerOffset) * cellSize,
          piece.elevation,
          (piece.targetPosition[1] - centerOffset) * cellSize
        ] : null);

        return (
          <GamePiece
            key={piece.id}
            modelPath={piece.modelPath}
            name={piece.id}
            position={worldPos as [number, number, number]}
            gridPosition={piece.gridPosition}
            onSelect={onPieceSelect}
            isSelected={
              selectedPiece &&
              selectedPiece[0] === piece.gridPosition[0] &&
              selectedPiece[1] === piece.gridPosition[1]
            }
            targetPosition={piece.targetPosition ? [
              (piece.targetPosition[0] - centerOffset) * cellSize,
              piece.elevation,
              (piece.targetPosition[1] - centerOffset) * cellSize
            ] : null}
            targetWorldPosition={piece.targetWorldPosition}
            onMove={piece.onMove}
            characterState={characterState}
            isAttackTarget={piece.id === attackTargetId}
            speechText={piece.speechText}
            voiceURI={piece.voiceURI}
            onSpeakRequest={onCharacterSpeak}
            health={piece.health}
            maxHealth={piece.maxHealth}
          />
        );
      })}

      {highlightedCells.map((cell, index) => {
        const worldPos = [
          (cell[0] - centerOffset) * cellSize,
          0.1,
          (cell[1] - centerOffset) * cellSize
        ];
        return (
          <HighlightCell
            key={`highlight-${index}`}
            position={worldPos as [number, number, number]}
            onClick={() => handleCellClick(cell)}
          />
        );
      })}

      {rangedTargets.map((cell, index) => {
        const worldPos = [
          (cell[0] - centerOffset) * cellSize,
          0.1,
          (cell[1] - centerOffset) * cellSize
        ];
        return (
          <HighlightCell
            key={`ranged-${index}`}
            position={worldPos as [number, number, number]}
            color="#3b82f6"
            opacity={0.5}
            onClick={() => onRangedSelect && onRangedSelect(cell)}
            onPointerOver={() => onRangedHover && onRangedHover(cell)}
            onPointerOut={() => onRangedHover && onRangedHover(null)}
          />
        );
      })}
    </group>
  );
}