import { useCallback } from 'react';
import { useGameStore } from './zustand';
import type { GamePiece } from '../interface/GamePiece';
import type { Character } from '../interface/Common';
import * as THREE from 'three';

export const useGameActions = () => {
  const {
    setSelectedPiece,
    setHighlightedCells,
    setIsMoving,
    setCharacterState,
    setAttackTargetId,
    updateGamePiece,
    moveGamePiece,
    getSurroundingCells,
    findClosestEnemy,
    isValidMove,
    isPieceAt,
    gamePieces,
    isPlayerTurn,
    isMoving,
    navMatrix,
  } = useGameStore();

  const handlePieceSelect = useCallback((gridPos: [number, number]) => {
    if (isPlayerTurn && !isMoving) {
      setSelectedPiece(gridPos);
      setHighlightedCells(getSurroundingCells(gridPos));
    }
  }, [isPlayerTurn, isMoving, setSelectedPiece, setHighlightedCells, getSurroundingCells]);

  const handlePieceMove = useCallback((fromGridPos: [number, number], toGridPos: [number, number]) => {
    if (isPlayerTurn && !isMoving) {
      if (!isValidMove(fromGridPos, toGridPos)) {
        console.log("Cannot move to this position - invalid move");
        return;
      }

      setIsMoving(true);
      setCharacterState("MOVING");

      const piece = isPieceAt(fromGridPos);
      if (piece) {
        updateGamePiece(piece.id, { targetPosition: toGridPos });

        setTimeout(() => {
          moveGamePiece(piece.id, toGridPos);
          setSelectedPiece(null);
          setHighlightedCells([]);
          setIsMoving(false);
          setCharacterState("idle");
        }, 1000);
      }
    }
  }, [isPlayerTurn, isMoving, isValidMove, isPieceAt, updateGamePiece, moveGamePiece, setIsMoving, setCharacterState, setSelectedPiece, setHighlightedCells]);

  const handleMeleeAttack = useCallback((selectedPiece: [number, number] | null) => {
    if (selectedPiece && isPlayerTurn && !isMoving) {
      const targetId = findClosestEnemy(selectedPiece);
      if (targetId) {
        setAttackTargetId(targetId);
        setCharacterState("attack");
        
        setTimeout(() => {
          setCharacterState("idle");
          setAttackTargetId(null);
        }, 1500);
      }
    }
  }, [isPlayerTurn, isMoving, findClosestEnemy, setAttackTargetId, setCharacterState]);

  const handleRangedAttack = useCallback((selectedPiece: [number, number] | null) => {
    if (selectedPiece && isPlayerTurn && !isMoving) {
      const targetId = findClosestEnemy(selectedPiece);
      if (targetId) {
        setAttackTargetId(targetId);
        setCharacterState("RANGED");
        
        setTimeout(() => {
          setCharacterState("idle");
          setAttackTargetId(null);
        }, 1500);
      }
    }
  }, [isPlayerTurn, isMoving, findClosestEnemy, setAttackTargetId, setCharacterState]);

  return {
    handlePieceSelect,
    handlePieceMove,
    handleMeleeAttack,
    handleRangedAttack,
  };
};

export const useSpeechSystem = () => {
  const { setIsSpeaking, setCharacterState } = useGameStore();

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
    window.speechSynthesis.speak(utterance);
    
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [setIsSpeaking]);

  const handleCharacterSpeak = useCallback((characterId: string) => {
    const { gamePieces } = useGameStore.getState();
    const character = gamePieces.find(piece => piece.id === characterId);
    
    if (character && character.speechText) {
      setCharacterState("SPEAKING");
      speak(character.speechText, character.voiceURI);
      
      setTimeout(() => {
        setCharacterState("idle");
      }, 2000);
    }
  }, [speak, setCharacterState]);

  return { speak, handleCharacterSpeak };
};

export const useCharacterManagement = () => {
  const { addGamePiece, findValidPositions, navMatrix } = useGameStore();

  const handleCharacterSelect = useCallback((selectedCharacter: Character) => {
    const validPositions = findValidPositions();
    if (validPositions.length > 0) {
      const newPiece: GamePiece = {
        id: selectedCharacter.id + '_' + Date.now(),
        modelPath: selectedCharacter.modelPath,
        gridPosition: validPositions[0],
        elevation: selectedCharacter.id === 'tula' ? 1 : 0,
        targetPosition: null,
        isEnemy: selectedCharacter.isEnemy,
        speechText: selectedCharacter.speechText,
        voiceURI: selectedCharacter.voiceURI,
        name: selectedCharacter.name,
        class: selectedCharacter.class,
        stats: selectedCharacter.stats,
        abilities: selectedCharacter.abilities,
        rarity: selectedCharacter.rarity,
        element: selectedCharacter.element,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
      };
      
      addGamePiece(newPiece);
    }
  }, [addGamePiece, findValidPositions]);

  return { handleCharacterSelect };
};

export const useBoardManagement = () => {
  const {
    setBoardSize,
    setNavMatrix,
    setBoardTextures,
    setBoardInfo,
    setGeneratedImage,
    addGamePiece,
    gamePieces,
    findValidPositions,
  } = useGameStore();

  const handleMetadataUpload = useCallback((metadata: any) => {
    if (metadata.gridSize) {
      setBoardSize(metadata.gridSize);
    }
    
    if (metadata.navigationMatrix) {
      setNavMatrix(metadata.navigationMatrix);
    }
    
    if (metadata.imageUrl) {
      setGeneratedImage(metadata.imageUrl);
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(metadata.imageUrl, (texture: any) => { 
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 16;
        
        setBoardTextures({ baseTexture: texture });
      });
    }
    
    setBoardInfo({
      gridSize: metadata.gridSize || useGameStore.getState().boardSize,
      walkableTiles: metadata.navigationMatrix ? 
        metadata.navigationMatrix.flat().filter((cell: number) => cell === 1).length : 0,
      totalTiles: metadata.gridSize ? metadata.gridSize * metadata.gridSize : 0
    });
    
    const validPositions = findValidPositions();
    if (validPositions.length > 0) {
      const currentPieces = useGameStore.getState().gamePieces;
      currentPieces.forEach((piece, index) => {
        const safeIndex = index % validPositions.length;
        const newPos = validPositions[safeIndex];
        useGameStore.getState().updateGamePiece(piece.id, { 
          gridPosition: newPos,
          targetPosition: null 
        });
      });
    }
  }, [setBoardSize, setNavMatrix, setGeneratedImage, setBoardTextures, setBoardInfo, findValidPositions]);

  const handleGenerateFloorMap = useCallback(async (result: any) => {
    const newMatrix = result.map;
    const newBoardSize = result.grid_size;
    
    setNavMatrix(newMatrix);
    setBoardSize(newBoardSize);
    setGeneratedImage(result.image);
    
    if (result.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(result.image, (texture: any) => { 
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 16;
        
        setBoardTextures({ baseTexture: texture });
      });
    }
    
    setBoardInfo({
      gridSize: newBoardSize,
      walkableTiles: result.metadata.walkable_tiles,
      totalTiles: result.metadata.total_tiles
    });
  }, [setNavMatrix, setBoardSize, setGeneratedImage, setBoardTextures, setBoardInfo]);

  return {
    handleMetadataUpload,
    handleGenerateFloorMap,
  };
};
