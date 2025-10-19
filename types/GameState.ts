import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { BoardTextures, BoardInfo, AssetUrls, Character } from './Common';
import type { GamePiece } from './GamePiece';
import type { EnemyAI, EnemyAIDecision } from '../lib/EnemyAI';

export interface GameState {
  boardSize: number;
  cellSize: number;
  navMatrix: number[][];
  boardTextures: BoardTextures;
  boardInfo: BoardInfo;
  generatedImage: string;
  environment: any | null;

  gamePieces: GamePiece[];
  selectedPiece: [number, number] | null;
  highlightedCells: [number, number][];
  selectedCharacter: GamePiece | null;
  availableCharacters: Character[];

  isPlayerTurn: boolean;
  isMoving: boolean;
  characterState: 'idle' | 'MOVING' | 'attack' | 'RANGED' | 'SPEAKING';
  attackTargetId: string | null;
  gamePhase: 'setup' | 'playing' | 'paused' | 'ended';
  turnCount: number;

  sidebarOpen: boolean;
  showCharacterSelection: boolean;
  showMetadataUploader: boolean;
  showAPIConfigPanel: boolean;
  isSpeaking: boolean;

  assetUrls: AssetUrls;
  assetsLoading: boolean;
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;

  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;

  enemyAI: EnemyAI | null;
  isEnemyTurn: boolean;
  enemyDecisions: Map<string, EnemyAIDecision>;

  setBoardSize: (size: number) => void;
  setNavMatrix: (matrix: number[][]) => void;
  setBoardTextures: (textures: Partial<BoardTextures>) => void;
  setBoardInfo: (info: Partial<BoardInfo>) => void;
  setGeneratedImage: (url: string) => void;
  setEnvironment: (texture: any | null) => void;

  addGamePiece: (piece: GamePiece) => void;
  removeGamePiece: (id: string) => void;
  updateGamePiece: (id: string, updates: Partial<GamePiece>) => void;
  moveGamePiece: (id: string, newPosition: [number, number]) => void;
  setSelectedPiece: (position: [number, number] | null) => void;
  setHighlightedCells: (cells: [number, number][]) => void;
  setSelectedCharacter: (character: GamePiece | null) => void;
  setAvailableCharacters: (characters: Character[]) => void;

  setIsPlayerTurn: (isPlayerTurn: boolean) => void;
  setIsMoving: (isMoving: boolean) => void;
  setCharacterState: (state: 'idle' | 'MOVING' | 'attack' | 'RANGED' | 'SPEAKING') => void;
  setAttackTargetId: (id: string | null) => void;
  setGamePhase: (phase: 'setup' | 'playing' | 'paused' | 'ended') => void;
  nextTurn: () => void;
  resetGame: () => void;

  setSidebarOpen: (open: boolean) => void;
  setShowCharacterSelection: (show: boolean) => void;
  setShowMetadataUploader: (show: boolean) => void;
  setShowAPIConfigPanel: (show: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;

  setAssetUrls: (urls: Partial<AssetUrls>) => void;
  setAssetsLoading: (loading: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationError: (error: string | null) => void;

  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;

  findValidPositions: () => [number, number][];
  getSurroundingCells: (gridPos: [number, number]) => [number, number][];
  findClosestEnemy: (attackerPos: [number, number]) => string | null;
  isPieceAt: (position: [number, number]) => GamePiece | null;
  isValidMove: (fromPos: [number, number], toPos: [number, number]) => boolean;

  initializeEnemyAI: () => void;
  setIsEnemyTurn: (isEnemyTurn: boolean) => void;
  setEnemyDecisions: (decisions: Map<string, EnemyAIDecision>) => void;
  executeEnemyTurn: () => void;
  completeEnemyMoves: () => void;
}
