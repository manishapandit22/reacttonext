"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Grid, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import RPGGameHUD from "@/components/RpgGameHud";
import { CameraSetup } from "@/components/CameraSetup";
import { GameBoard } from "@/components/GameBoard";
import { useFloorMappingAPI } from "@/components/apiConfig";
import { APIConfigPanel } from "@/components/ApiConfigPanel";
import CharacterSelectionModal from "@/components/CharacterSelectionModal";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button_copy";
import { BoardMetadataUploader } from "@/components/BoardMetadataUploader";
import GameSidebar from "@/components/ui/GameSidebar";
import { AttackArc } from "@/components/AttackArc";
import { useEnemyAI } from "../../globals/useEnemyAI";
import { useGameStore } from "../../globals/zustand";
import { EnemyAITest } from "@/components/EnemyAITest";

const fetchAssetUrl = async (assetPath: string): Promise<string> => {
  try {
    const response = await fetch(assetPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset URL: ${response.statusText}`);
    }
    const data = await response.json();
    return data.url || data.signedUrl || assetPath;
  } catch (error) {
    console.error(`Error fetching asset URL for ${assetPath}:`, error);
    return assetPath;
  }
};

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, voice: string | null = null) => {
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
    // window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, []);

  return { speak, isSpeaking };
};

export const CharacterSpeech = ({ text, name, position = [0, 1.5, 0] }: { text: string, name: string, position?: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.8, 0.6, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>

      <Text
        position={[0, 0.2, 0.03]}
        fontSize={0.08}
        color="#000000"
        maxWidth={1.6}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>

      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function SecurityModal({ onUnlock }: { onUnlock: () => void }) {
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const PASSWORD = "kraken30@test";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputPassword === PASSWORD) {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.85)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#222",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 4px 32px #0008",
          minWidth: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: 16 }}>Enter Password</h2>
        <input
          type="password"
          value={inputPassword}
          onChange={e => setInputPassword(e.target.value)}
          placeholder="Password"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
            marginBottom: 12,
            width: "100%"
          }}
          autoFocus
        />
        {error && <div style={{ color: "#ff6b6b", marginBottom: 8 }}>{error}</div>}
        <button
          type="submit"
          style={{
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 24px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

const ChesslikeGame = ({ navigationMatrix = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 0, 0, 0, 0, 0, 1],
] }: { navigationMatrix?: number[][] }) => {

  const [showMetadataUploader, setShowMetadataUploader] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<[number, number][]>([]);
  const [environment, setEnvironment] = useState<any>(null);
  const [boardTextures, setBoardTextures] = useState({
    baseTexture: null,
    heightTexture: null,
    normalTexture: null
  });
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [assetsLoading, setAssetsLoading] = useState(false);
  const { 
    gamePieces, 
    addGamePiece, 
    setNavMatrix: setStoreNavMatrix, 
    navMatrix,
    updateGamePiece,
    moveGamePiece,
    setIsPlayerTurn: setStoreIsPlayerTurn,
    setIsMoving: setStoreIsMoving,
    isPlayerTurn: storeIsPlayerTurn,
    isMoving: storeIsMoving,
    isEnemyTurn: storeIsEnemyTurn
  } = useGameStore();
  const navMatrixInitializedRef = useRef(false);
  const initialPiecesAddedRef = useRef(false);
  
  useEffect(() => {
    if (navMatrixInitializedRef.current) return;
    
    const currentNavMatrix = useGameStore.getState().navMatrix;
    const isDefaultMatrix = currentNavMatrix.length === 10 && currentNavMatrix[0].length === 10;
    
    if (navigationMatrix) {
      setStoreNavMatrix(navigationMatrix);
    } else if (isDefaultMatrix && currentNavMatrix.every(row => row.every(cell => cell === 1))) {
      const defaultMatrix = Array(10)
        .fill(1)
        .map(() =>
          Array(10)
            .fill(1)
            .map(() => (Math.random() > 0.5 ? 1 : 0))
        );
      setStoreNavMatrix(defaultMatrix);
    }
    
    navMatrixInitializedRef.current = true;
  }, [navigationMatrix]); 
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [characterState, setCharacterState] = useState<"idle" | "MOVING" | "attack" | "RANGED" | "SPEAKING">("idle");
  const [attackTargetId, setAttackTargetId] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [boardSize, setBoardSize] = useState(10);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState<any[]>([]);
  const [generatedImage, setGeneratedImage] = useState("");
  const [boardInfo, setBoardInfo] = useState({
    gridSize: 10,
    walkableTiles: 0,
    totalTiles: 0
  });
  const [arcState, setArcState] = useState({
    visible: false,
    start: [0, 0, 0] as [number, number, number],
    end: [0, 0, 0] as [number, number, number],
    color: '#ff2200',
    height: 2
  });
  const [arcPreview, setArcPreview] = useState({
    visible: false,
    start: [0, 0, 0] as [number, number, number],
    end: [0, 0, 0] as [number, number, number],
    color: '#60a5fa',
    height: 2
  });
  const [isRangedTargeting, setIsRangedTargeting] = useState(false);
  const [rangedTargets, setRangedTargets] = useState<[number, number][]>([]);
  const [hoveredRangedCell, setHoveredRangedCell] = useState<[number, number] | null>(null);

  const { speak, isSpeaking } = useSpeech();
  const { isEnemyTurn: hookIsEnemyTurn, triggerEnemyTurn } = useEnemyAI();

  const cellSize = 1;

  const isPlayerTurn = storeIsPlayerTurn;
  const isMoving = storeIsMoving;
  const isEnemyTurn = storeIsEnemyTurn;

  useEffect(() => {
    if (!isPlayerTurn && !isMoving && !isEnemyTurn) {
      const timeout = setTimeout(() => {
        console.log('🔄 Auto-triggering enemy turn from page...');
        triggerEnemyTurn();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, isMoving, isEnemyTurn, triggerEnemyTurn]);

  useEffect(() => {
    if (isEnemyTurn && !isMoving) {
      console.log('✅ Enemy turn completed, switching to player turn');
      setStoreIsPlayerTurn(true);
    }
  }, [isEnemyTurn, isMoving, setStoreIsPlayerTurn]);

  useEffect(() => {
    const loadAssetUrls = async () => {
      if (initialPiecesAddedRef.current) {
        console.log('Initial pieces already added, skipping...');
        return;
      }

      setAssetsLoading(true);
      try {
        const [envUrl, knightUrl, tulaUrl, enemyUrl, wolfUrl, erikaUrl] = await Promise.all([
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/environment/enve.exr?action=url"),
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/hero/untitled.glb?action=url"),
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/hero/tula1.glb?action=url"),
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/enemy/enemy.glb?action=url"),
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/companion/wolf.glb?action=url"),
          fetchAssetUrl("https://smartmap-js.vercel.app/api/assets/3d_assets/hero/erika.glb?action=url")
        ]);

        const urls = {
          environment: envUrl,
          knight: knightUrl,
          tula: tulaUrl,
          enemy: enemyUrl,
          wolf: wolfUrl,
          erika: erikaUrl
        };

        setAssetUrls(urls);

        const existingPieces = useGameStore.getState().gamePieces;
        if (existingPieces.length > 0) {
          console.log('Game pieces already exist, skipping initial piece creation');
          initialPiecesAddedRef.current = true;
          return;
        }

        const pieces = [
          {
            id: "knight1",
            modelPath: knightUrl,
            gridPosition: [4, 2] as [number, number],
            elevation: 0,
            targetPosition: null,
            speedFeet: 12,
            onMove: (fromPos: [number, number], toPos: [number, number]) => handleMove(fromPos, toPos, "knight1"),
            isEnemy: false,
            speechText: "I stand ready to defend our kingdom!",
            voiceURI: null,
          },
          {
            id: "wolf1",
            modelPath: wolfUrl,
            gridPosition: [5, 1] as [number, number],
            elevation: 0,
            targetPosition: null,
            speedFeet: 9,
            onMove: (fromPos: [number, number], toPos: [number, number]) => handleMove(fromPos, toPos, "wolf1"),
            isEnemy: false,
            speechText: "Grrrr... I smell danger nearby.",
            voiceURI: null,
          },
          {
            id: "archer1",
            modelPath: erikaUrl,
            gridPosition: [2, 3] as [number, number],
            elevation: 0,
            targetPosition: null,
            speedFeet: 6,
            onMove: (fromPos: [number, number], toPos: [number, number]) => handleMove(fromPos, toPos, "archer1"),
            isEnemy: true,
            speechText: "My arrows never miss their target.",
            voiceURI: null,
          },
          {
            id: "tula1",
            modelPath: tulaUrl,
            gridPosition: [2, 6] as [number, number],
            elevation: 1,
            targetPosition: null,
            speedFeet: 6,
            onMove: (fromPos: [number, number], toPos: [number, number]) => handleMove(fromPos, toPos, "tula1"),
            isEnemy: true,
            speechText: "I have been watching you from the shadows. Your moves are predictable.",
            voiceURI: null,
          },
        ];
        
        console.log('Adding initial game pieces...');
        pieces.forEach(piece => {
          addGamePiece(piece);
          console.log(`Added piece: ${piece.id}, isEnemy: ${piece.isEnemy}, position: ${piece.gridPosition}`);
        });

        initialPiecesAddedRef.current = true;
        console.log("Asset URLs loaded and initial pieces added:", urls);
      } catch (error) {
        console.error("Error loading asset URLs:", error);
      } finally {
        setAssetsLoading(false);
      }
    };

    loadAssetUrls();
  }, []);

  // Load environment texture
  // useEffect(() => {
  //   if (assetUrls.environment) {
  //     const exrLoader = new EXRLoader();
  //     exrLoader.load(
  //       assetUrls.environment,
  //       (texture) => {
  //         texture.mapping = THREE.EquirectangularReflectionMapping;
  //         setEnvironment(texture);
  //         console.log("Environment texture loaded successfully");
  //       },
  //       undefined,
  //       (error) => {
  //         console.error("Error loading environment texture:", error);
  //       }
  //     );
  //   }
  // }, [assetUrls.environment]);

  useEffect(() => {
    if (selectedPiece) {
      const character = gamePieces.find(
        piece => piece.gridPosition[0] === selectedPiece[0] &&
          piece.gridPosition[1] === selectedPiece[1]
      );
      setSelectedCharacter(character || null);
    } else {
      setSelectedCharacter(null);
    }
  }, [selectedPiece, gamePieces]);

  const findValidPositions = useCallback((matrix: number[][]) => {
    const positions: [number, number][] = [];
    for (let z = 0; z < matrix.length; z++) {
      for (let x = 0; x < matrix[z].length; x++) {
        if (matrix[z][x] === 1) {
          positions.push([x, z]);
        }
      }
    }
    return positions;
  }, []);

  //cells with BFS limited by tilesPerMove all direction
  const computeReachableCells = useCallback(
    (start: [number, number], tilesPerMove: number, matrix: number[][], occupied: Set<string>) => {
      const inBounds = (x: number, z: number) => z >= 0 && z < matrix.length && x >= 0 && x < matrix[0].length;
      const key = (x: number, z: number) => `${x},${z}`;
      const visited = new Set<string>();
      const queue: Array<{ x: number; z: number; d: number }> = [{ x: start[0], z: start[1], d: 0 }];
      visited.add(key(start[0], start[1]));

      const deltas = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];

      const reachable: [number, number][] = [];

      while (queue.length) {
        const { x, z, d } = queue.shift()!;
        if (d > 0) reachable.push([x, z]);
        if (d === tilesPerMove) continue;
        for (const [dx, dz] of deltas) {
          const nx = x + dx;
          const nz = z + dz;
          if (!inBounds(nx, nz)) continue;
          if (matrix[nz][nx] !== 1) continue; //blocked per navigation matrix
          const k = key(nx, nz);
          if (visited.has(k)) continue;
          if (occupied.has(k)) continue; //cannot traverse through occupied cells
          visited.add(k);
          queue.push({ x: nx, z: nz, d: d + 1 });
        }
      }

      return reachable;
    }, []);

  const findClosestEnemy = useCallback(
    (attackerPos: [number, number]) => {
      const attackerPiece = gamePieces.find(
        (piece) =>
          piece.gridPosition[0] === attackerPos[0] &&
          piece.gridPosition[1] === attackerPos[1]
      );
      if (!attackerPiece) return null;

      let closestEnemy: any = null;
      let minDistance = Infinity;

      gamePieces.forEach((piece) => {
        if (piece.isEnemy !== attackerPiece.isEnemy) {
          const distance = Math.sqrt(
            Math.pow(piece.gridPosition[0] - attackerPos[0], 2) +
            Math.pow(piece.gridPosition[1] - attackerPos[1], 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = piece;
          }
        }
      });

      console.log(`Closest enemy for ${attackerPiece.id}: ${closestEnemy ? closestEnemy.id : "none"}`);
      return closestEnemy ? closestEnemy.id : null;
    },
    [gamePieces]
  );

  const getSurroundingCells = useCallback(
    (gridPos: [number, number]) => {
      const [x, z] = gridPos;
      const surroundingCells: [number, number][] = [];

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;

          const newX = x + i;
          const newZ = z + j;

          if (
            newX >= 0 && newX < boardSize &&
            newZ >= 0 && newZ < boardSize &&
            navMatrix[newZ][newX] === 1
          ) {
            const isOccupied = gamePieces.some(
              (piece) =>
                piece.gridPosition[0] === newX && piece.gridPosition[1] === newZ
            );

            if (!isOccupied) {
              surroundingCells.push([newX, newZ]);
            }
          }
        }
      }

      return surroundingCells;
    },
    [gamePieces, boardSize, navMatrix]
  );

  const { generateFloorMap, isGenerating, error, progress } = useFloorMappingAPI();

  const handleGenerateFloorMap = async (prompt, apiKey, sceneSize, apiUrl) => {
    try {
      const result = await generateFloorMap(prompt, apiKey, sceneSize, apiUrl);

      console.log('API Response:', result);

      const newMatrix = result.map;
      const newBoardSize = result.grid_size;

              setStoreNavMatrix(newMatrix);
      setBoardSize(newBoardSize);
      setGeneratedImage(result.image);

      if (result.image) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(result.image, (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = 16;

          setBoardTextures(prev => ({
            ...prev,
            baseTexture: texture
          }));
        });
      }

      setBoardInfo({
        gridSize: newBoardSize,
        walkableTiles: result.metadata.walkable_tiles,
        totalTiles: result.metadata.total_tiles
      });

    } catch (err) {
      console.error('Failed to generate floor map:', err);
    }
  };

  const handleMetadataUpload = (metadata) => {
    if (metadata.gridSize) {
      setBoardSize(metadata.gridSize);
    }

    if (metadata.navigationMatrix) {
              setStoreNavMatrix(metadata.navigationMatrix);
    }

    if (metadata.imageUrl) {
      setGeneratedImage(metadata.imageUrl);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(metadata.imageUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 16;

        setBoardTextures(prev => ({
          ...prev,
          baseTexture: texture
        }));
      });
    }

    setBoardInfo({
      gridSize: metadata.gridSize || boardSize,
      walkableTiles: metadata.navigationMatrix ?
        metadata.navigationMatrix.flat().filter(cell => cell === 1).length : 0,
      totalTiles: metadata.gridSize ? metadata.gridSize * metadata.gridSize : 0
    });

    const validPositions = findValidPositions(metadata.navigationMatrix || navMatrix);
    if (validPositions.length > 0) {
      const updatedPieces = gamePieces.map((piece, index) => {
        const safeIndex = index % validPositions.length;
        const newPos = validPositions[safeIndex];
        return {
          ...piece,
          gridPosition: newPos,
          targetPosition: null
        };
              });
      updatedPieces.forEach(piece => {
        updateGamePiece(piece.id, piece);
      });
    }
  };

  const handlePieceSelect = useCallback(
    (gridPos: [number, number]) => {
      if (isPlayerTurn && !isMoving) {
        setSelectedPiece(gridPos);
        const piece = gamePieces.find(p => p.gridPosition[0] === gridPos[0] && p.gridPosition[1] === gridPos[1]);
        const speedFeet = piece?.speedFeet ?? 6;
        const tilesPerMove = Math.max(0, Math.floor(speedFeet / 3));

        const occupied = new Set<string>(
          gamePieces
            .filter(p => !(p.gridPosition[0] === gridPos[0] && p.gridPosition[1] === gridPos[1]))
            .map(p => `${p.gridPosition[0]},${p.gridPosition[1]}`)
        );

        const reachable = computeReachableCells(gridPos, tilesPerMove, navMatrix, occupied);
        setHighlightedCells(reachable);
      }
    },
    [isPlayerTurn, isMoving, gamePieces, navMatrix, computeReachableCells]
  );

  const handleMove = (fromPos: [number, number], toPos: [number, number], pieceId: string) => {
    console.log(`Piece ${pieceId} moved from ${fromPos} to ${toPos}`);
  };

  const handlePieceMove = useCallback(
    (fromGridPos: [number, number], toGridPos: [number, number]) => {
      if (isPlayerTurn && !isMoving) {
        if (navMatrix[toGridPos[1]][toGridPos[0]] !== 1) {
          console.log("Cannot move to this position - not navigable");
          return;
        }
        setStoreIsMoving(true);
        setCharacterState("MOVING");

        const pieceIndex = gamePieces.findIndex(
          (piece) =>
            piece.gridPosition[0] === fromGridPos[0] &&
            piece.gridPosition[1] === fromGridPos[1]
        );

        if (pieceIndex !== -1) {
          const updatedPieces = [...gamePieces];
          updatedPieces[pieceIndex] = {
            ...updatedPieces[pieceIndex],
            targetPosition: toGridPos,
          };
          updateGamePiece(updatedPieces[pieceIndex].id, updatedPieces[pieceIndex]);

          setTimeout(() => {
            const newPieces = [...updatedPieces];
            newPieces[pieceIndex] = {
              ...updatedPieces[pieceIndex],
              gridPosition: toGridPos,
              targetPosition: null,
            };
            moveGamePiece(newPieces[pieceIndex].id, toGridPos);
            setSelectedPiece(null);
            setHighlightedCells([]);
            setCharacterState("idle");
            
            // Reset moving state first, then switch turns
            setStoreIsMoving(false);
            console.log('✅ Player movement completed, switching to enemy turn');
            
            // Small delay to ensure state is updated before switching turns
            setTimeout(() => {
              setStoreIsPlayerTurn(false);
            }, 100);
          }, 1000);
        }
      }
    },
    [navMatrix, isPlayerTurn, isMoving, gamePieces, setStoreIsMoving, updateGamePiece, moveGamePiece, setStoreIsPlayerTurn]
  );

  const handleMeleeAttack = useCallback(
    () => {
      if (selectedPiece && isPlayerTurn && !isMoving) {
        console.log("Melee attack triggered", {
          selectedPiece,
          characterState,
        });
        const targetId = findClosestEnemy(selectedPiece);
        if (targetId) {
          setAttackTargetId(targetId);
          setCharacterState("attack");

          const impactSound = new Audio("/fire.mp3");
          if (impactSound) {
            impactSound.volume = 0.3;
            impactSound.play().catch(e => console.log("Audio play failed:", e));
          }

          setTimeout(() => {
            setCharacterState("idle");
            setAttackTargetId(null);
          }, 1500);
        } else {
          console.log("No enemy target found for melee attack");
        }
      } else {
        console.log("Melee attack blocked", {
          selectedPiece,
          isPlayerTurn,
          isMoving,
        });
      }
    },
    [selectedPiece, isPlayerTurn, isMoving, findClosestEnemy]
  );

  const handleRangedAttack = useCallback(() => {
    if (!selectedPiece || !isPlayerTurn || isMoving) {
      console.log("Ranged attack blocked", { selectedPiece, isPlayerTurn, isMoving });
      return;
    }

    if (isRangedTargeting) {
      setIsRangedTargeting(false);
      setRangedTargets([]);
      setArcPreview((p) => ({ ...p, visible: false }));
      return;
    }

    const [sx, sy] = selectedPiece;
    const rangeTiles = 3; 
    const targets: [number, number][] = [];
    for (let dx = -rangeTiles; dx <= rangeTiles; dx++) {
      for (let dy = -rangeTiles; dy <= rangeTiles; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = sx + dx;
        const ny = sy + dy;
        if (nx < 0 || ny < 0 || ny >= boardSize || nx >= boardSize) continue;
        if (navMatrix[ny] && navMatrix[ny][nx] === 1) {
          //chebyshev distance within range
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= rangeTiles) {
            targets.push([nx, ny]);
          }
        }
      }
    }
    setRangedTargets(targets);
    setIsRangedTargeting(true);
  }, [selectedPiece, isPlayerTurn, isMoving, boardSize, navMatrix]);

  const handleRangedHover = useCallback((gridPos: [number, number] | null) => {
    setHoveredRangedCell(gridPos);
    if (!gridPos || !selectedPiece) {
      setArcPreview((p) => ({ ...p, visible: false }));
      return;
    }
    const centerOffset = (boardSize - 1) / 2;
    const [sx, sy] = selectedPiece;
    const [tx, ty] = gridPos;
    const start: [number, number, number] = [
      (sx - centerOffset) * cellSize,
      0.5,
      (sy - centerOffset) * cellSize,
    ];
    const end: [number, number, number] = [
      (tx - centerOffset) * cellSize,
      0.5,
      (ty - centerOffset) * cellSize,
    ];
    setArcPreview({ visible: true, start, end, color: '#60a5fa', height: 2 });
  }, [selectedPiece, boardSize, cellSize]);

  const handleRangedSelect = useCallback((gridPos: [number, number]) => {
    if (!selectedPiece) return;
    const centerOffset = (boardSize - 1) / 2;
    const [sx, sy] = selectedPiece;
    const [tx, ty] = gridPos;
    const start: [number, number, number] = [
      (sx - centerOffset) * cellSize,
      0.5,
      (sy - centerOffset) * cellSize,
    ];
    const end: [number, number, number] = [
      (tx - centerOffset) * cellSize,
      0.5,
      (ty - centerOffset) * cellSize,
    ];

    setArcPreview((p) => ({ ...p, visible: false }));
    setIsRangedTargeting(false);
    setRangedTargets([]);

    setArcState({ visible: true, start, end, color: '#ff2200', height: 2 });
    setCharacterState('RANGED');

    const magicSound = new Audio('/fire.mp3');
    try { magicSound.volume = 0.2; magicSound.play(); } catch {}

    setTimeout(() => {
      setArcState((a) => ({ ...a, visible: false }));
      setCharacterState('idle');
    }, 1500);
  }, [selectedPiece, boardSize, cellSize]);

  const handleCharacterSpeak = useCallback(() => {
    if (selectedCharacter && selectedCharacter.speechText) {
      console.log(`Character ${selectedCharacter.id} is speaking: ${selectedCharacter.speechText}`);

      setCharacterState("SPEAKING");
      speak(selectedCharacter.speechText, selectedCharacter.voiceURI);

      setTimeout(() => {
        setCharacterState("idle");
      }, 2000);
    }
  }, [selectedCharacter, speak]);

  useEffect(() => {
    if (assetUrls.knight && assetUrls.wolf && assetUrls.enemy && assetUrls.erika && assetUrls.tula) {
      const characterOptions = [
        {
          id: "knight1",
          name: "Sir Galahad",
          class: "Knight",
          modelPath: assetUrls.knight,
          description: "A noble warrior with unwavering courage and masterful swordsmanship.",
          stats: { strength: 9, defense: 8, agility: 6, magic: 4 },
          abilities: ["Sword Strike", "Shield Bash", "Rally"],
          rarity: "legendary",
          element: "light",
          displayIcon: "⚔️",
          isEnemy: false,
          speechText: "I stand ready to defend our kingdom!",
          voiceURI: null,
        },
        {
          id: "wolf1",
          name: "Fenris",
          class: "Beast Companion",
          modelPath: assetUrls.wolf,
          description: "A mystical wolf with keen senses and lightning-fast reflexes.",
          stats: { strength: 7, defense: 6, agility: 9, magic: 5 },
          abilities: ["Howl", "Pack Hunt", "Shadow Step"],
          rarity: "epic",
          element: "nature",
          displayIcon: "🐺",
          isEnemy: false,
          speechText: "Grrrr... I smell danger nearby.",
          voiceURI: null,
        },
        {
          id: "archer",
          name: "Erika Windshot",
          class: "Archer",
          modelPath: assetUrls.erika,
          description: "A master archer whose arrows never miss their intended target.",
          stats: { strength: 6, defense: 5, agility: 9, magic: 7 },
          abilities: ["Piercing Shot", "Rain of Arrows", "Eagle Eye"],
          rarity: "epic",
          element: "wind",
          displayIcon: "🏹",
          isEnemy: false,
          speechText: "My arrows never miss their target.",
          voiceURI: null,
        },
        {
          id: "tula",
          name: "Tula Shadowweaver",
          class: "Assassin Mage",
          modelPath: assetUrls.tula,
          description: "A mysterious figure who blends shadow magic with deadly precision.",
          stats: { strength: 5, defense: 4, agility: 8, magic: 10 },
          abilities: ["Shadow Strike", "Void Blast", "Invisibility"],
          rarity: "legendary",
          element: "shadow",
          displayIcon: "🔮",
          isEnemy: false,
          speechText: "I have been watching you from the shadows. Your moves are predictable.",
          voiceURI: null,
        },
        {
          id: "enemy1",
          name: "Dark Warrior",
          class: "Enemy Knight",
          modelPath: assetUrls.enemy,
          description: "A fallen knight consumed by darkness and hatred.",
          stats: { strength: 8, defense: 7, agility: 5, magic: 6 },
          abilities: ["Dark Strike", "Intimidate", "Berserker Rage"],
          rarity: "rare",
          element: "shadow",
          displayIcon: "👹",
          isEnemy: true,
          speechText: "Your kingdom will fall by my hand!",
          voiceURI: null,
        }
      ];

      setAvailableCharacters(characterOptions);
    }
  }, [assetUrls]);

  const handleCharacterSelect = useCallback((selectedCharacter) => {
    console.log('Character selected:', selectedCharacter);

    const existingCharacter = gamePieces.find(piece => 
      piece.id.startsWith(selectedCharacter.id) || 
      piece.name === selectedCharacter.name
    );
    
    if (existingCharacter) {
      console.log(`Character ${selectedCharacter.name} already exists in the game`);
      setShowCharacterSelection(false);
      return;
    }

    const validPositions = findValidPositions(navMatrix);
    if (validPositions.length > 0) {
      const newPiece = {
        id: selectedCharacter.id + '_' + Date.now(),
        modelPath: selectedCharacter.modelPath,
        gridPosition: validPositions[0] as [number, number],
        elevation: selectedCharacter.id === 'tula' ? 1 : 0,
        targetPosition: null,
        speedFeet: 6,
        onMove: (fromPos: [number, number], toPos: [number, number]) => handleMove(fromPos, toPos, selectedCharacter.id),
        isEnemy: selectedCharacter.isEnemy,
        speechText: selectedCharacter.speechText,
        voiceURI: selectedCharacter.voiceURI,
        name: selectedCharacter.name,
        class: selectedCharacter.class,
        stats: selectedCharacter.stats,
        abilities: selectedCharacter.abilities,
        rarity: selectedCharacter.rarity,
        element: selectedCharacter.element
      };

      addGamePiece(newPiece);
      console.log(`Added new character: ${newPiece.id} (${newPiece.name})`);
    }

    setShowCharacterSelection(false);
  }, [navMatrix, findValidPositions, handleMove, gamePieces]);

  const CharacterSelectionButton = () => (
    <button
      onClick={() => setShowCharacterSelection(true)}
      className="absolute top-24 left-4 z-40 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
    >
      <Star className="w-4 h-4" />
      Add Character
    </button>
  );

  const handleCharacterSpeakRequest = useCallback((characterId) => {
    const character = gamePieces.find(piece => piece.id === characterId);
    if (character && character.speechText) {
      console.log(`Character ${characterId} speech requested: ${character.speechText}`);
      speak(character.speechText, character.voiceURI);
    }
  }, [gamePieces, speak]);

  const checkForDuplicateIds = useCallback(() => {
    const ids = gamePieces.map(piece => piece.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.error('❌ Duplicate IDs found:', duplicates);
      console.log('All game pieces:', gamePieces.map(p => ({ id: p.id, name: p.name })));
    } else {
      console.log('✅ No duplicate IDs found');
    }
  }, [gamePieces]);

  const clearAllGamePieces = useCallback(() => {
    console.log('🧹 Clearing all game pieces...');
    gamePieces.forEach(piece => {
      useGameStore.getState().removeGamePiece(piece.id);
    });
    initialPiecesAddedRef.current = false;
    console.log('✅ Game pieces cleared and initialization flag reset');
  }, [gamePieces]);

  const reinitializeGamePieces = useCallback(() => {
    console.log('🔄 Reinitializing game pieces...');
    gamePieces.forEach(piece => {
      useGameStore.getState().removeGamePiece(piece.id);
    });
    initialPiecesAddedRef.current = false;
    setAssetsLoading(true);
    setTimeout(() => setAssetsLoading(false), 100);
    console.log('✅ Game pieces reinitialization triggered');
  }, [gamePieces]);

  const resetGameState = useCallback(() => {
    console.log('🔄 Resetting game state...');
    setStoreIsPlayerTurn(true);
    setStoreIsMoving(false);
    setCharacterState('idle');
    setSelectedPiece(null);
    setHighlightedCells([]);
    console.log('✅ Game state reset to player turn');
  }, [setStoreIsPlayerTurn, setStoreIsMoving, setCharacterState]);

  if (assetsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading Game Assets...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  const CameraPositionLogger = () => {
    const { camera } = useThree();
    const lastPosition = useRef([0, 0, 0]);

    useFrame(() => {
      const currentPos = [camera.position.x, camera.position.y, camera.position.z];
      const [lastX, lastY, lastZ] = lastPosition.current;

      const threshold = 0.001;
      if (
        Math.abs(currentPos[0] - lastX) > threshold ||
        Math.abs(currentPos[1] - lastY) > threshold ||
        Math.abs(currentPos[2] - lastZ) > threshold
      ) {
        // console.log('Camera Position:', currentPos);
        lastPosition.current = currentPos;
      }
    });

    return null;
  };


  return (
    <div className="h-screen w-screen relative">
      <APIConfigPanel
        onGenerate={handleGenerateFloorMap}
        isGenerating={isGenerating}
        progress={progress}
        error={error}
      />
      <CharacterSelectionButton />
      
      <button
        onClick={() => {
          console.log('🎯 Trigger button clicked!');
          console.log('Current game pieces:', gamePieces);
          console.log('Enemy pieces:', gamePieces.filter(p => p.isEnemy));
          console.log('Player pieces:', gamePieces.filter(p => !p.isEnemy));
          triggerEnemyTurn();
        }}
        className="absolute top-32 left-4 z-40 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
      >
        🎯 Trigger Enemy Turn
      </button>

      <button
        onClick={checkForDuplicateIds}
        className="absolute top-40 left-4 z-40 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
      >
        🔍 Check Duplicates
      </button>

      <button
        onClick={clearAllGamePieces}
        className="absolute top-48 left-4 z-40 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
      >
        🧹 Clear All Pieces
      </button>

      <button
        onClick={reinitializeGamePieces}
        className="absolute top-56 left-4 z-40 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
      >
        🔄 Reinitialize Pieces
      </button>

      <button
        onClick={resetGameState}
        className="absolute top-64 left-4 z-40 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
      >
        🔄 Reset Game State
      </button>
      {showMetadataUploader && (
        <div className="absolute top-12 right-4 z-50 w-96">
          <BoardMetadataUploader
            onMetadataUpload={(metadata) => {
              if (metadata.gridSize) setBoardSize(metadata.gridSize);
              if (metadata.imageUrl) setGeneratedImage(metadata.imageUrl);
              if (metadata.navigationMatrix) setStoreNavMatrix(metadata.navigationMatrix);
              if (metadata.imageUrl) setGeneratedImage(metadata.imageUrl);
              setShowMetadataUploader(false);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setShowMetadataUploader(false)}
          >
            Close
          </Button>
        </div>
      )}
      <button
        onClick={() => setShowMetadataUploader(!showMetadataUploader)}
        className="absolute top-4 right-4 z-40 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm"
      >
        {showMetadataUploader ? "Hide Upload" : "Upload Board"}
      </button>

      <CharacterSelectionModal
        isOpen={showCharacterSelection}
        onClose={() => setShowCharacterSelection(false)}
        onCharacterSelect={handleCharacterSelect}
        availableCharacters={availableCharacters}
      />
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={60} />
        <CameraSetup boardSize={boardSize} cellSize={cellSize} />
        <CameraPositionLogger />
        <ambientLight intensity={0.2} color="#8088a0" />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.9}
          color="#e0e8f0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight
          position={[4, 1.5, 4]}
          intensity={0.4}
          color="#ff5040"
          distance={10}
          decay={2}
          castShadow
        />
        <pointLight
          position={[2, 1.5, 7]}
          intensity={0.4}
          color="#ff5040"
          distance={10}
          decay={2}
          castShadow
        />
        <pointLight
          position={[1, 5, 5]}
          intensity={0.4}
          color="#ff5040"
          distance={10}
          decay={2}
          castShadow
        />
        <pointLight
          position={[4, 3, 4]}
          intensity={0.3}
          color="#e0e0e0"
          distance={12}
          decay={2}
        />
        {/* <fog attach="fog" args={["#2a2f38", 5, 15]} /> */}
        {/* {environment && (
          <>
            <primitive attach="background" object={environment} />
            <primitive attach="environment" object={environment} />
          </>
        )} */}

        <GameBoard
          boardSize={boardSize}
          cellSize={cellSize}
          selectedPiece={selectedPiece}
          highlightedCells={highlightedCells}
          gamePieces={gamePieces}
          onPieceSelect={handlePieceSelect}
          onPieceMove={handlePieceMove}
          characterState={characterState}
          attackTargetId={attackTargetId}
          navigationMatrix={navMatrix}
          onCharacterSpeak={handleCharacterSpeakRequest}
          boardImage={generatedImage}
          boardTextures={boardTextures}
          rangedTargets={isRangedTargeting ? rangedTargets : []}
          onRangedHover={handleRangedHover}
          onRangedSelect={handleRangedSelect}
        />
        {arcPreview.visible && (
          <AttackArc
            start={arcPreview.start}
            end={arcPreview.end}
            color={arcPreview.color}
            height={arcPreview.height}
            visible={arcPreview.visible}
            preview={true}
            speed={6}
            opacity={0.6}
          />
        )}
        {arcState.visible && (
          <AttackArc
            start={arcState.start}
            end={arcState.end}
            color={arcState.color}
            height={arcState.height}
            visible={arcState.visible}
            speed={3}
            opacity={1}
          />
        )}
        {/* <AttackArc
          start={[0, 0.5, 0]}
          end={[2, 0.5, 2]}
          color={'#00ff00'}
          height={2}
          visible={true}
        /> */}
        <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        // minDistance={7}
        // maxDistance={12}
        keyPanSpeed={1.5} 
        screenSpacePanning={true} 
        />
      </Canvas>
      {/* <button
        onClick={() => setSidebarOpen((open) => !open)}
        style={{
          position: "absolute",
          top: 150,
          left: 24,
          zIndex: 1100,
          background: sidebarOpen
            ? "linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)"
            : "linear-gradient(90deg, #6366f1 0%, #a21caf 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 48,
          height: 48,
          boxShadow: "0 4px 16px 0 rgba(80,0,120,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s"
          }}
        >
          <rect x="3" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity={sidebarOpen ? "1" : "0.5"} />
          <rect x="9" y="4" width="12" height="16" rx="2" stroke="currentColor" fill="none" />
          <polyline points="15 10 18 12 15 14" />
        </svg>
      </button> */}
      {/* <GameSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
       storyData={storyData}
       storyId={storyId}
       character={character}
       useAxiosWithAuth={useAxiosWithAuth}
      /> */}
      <RPGGameHUD
        onMeleeAttack={handleMeleeAttack}
        onRangedAttack={handleRangedAttack}
        onSpeak={handleCharacterSpeak}
        isPlayerTurn={isPlayerTurn}
        isMoving={isMoving}
        characterState={characterState}
        selectedPiece={selectedPiece}
        selectedCharacter={selectedCharacter}
        isEnemyTurn={isEnemyTurn}
      />
      {/* <EnemyAITest /> */}
    </div>
  );
};


export default function ProtectedPage(props: any) {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <>
      {/* {!unlocked && <SecurityModal onUnlock={() => setUnlocked(true)} />} */}
       <ChesslikeGame {...props} />
    </>
  );
}