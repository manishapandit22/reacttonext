import { useGameStore } from './zustand';
import type { GameState } from '../interface/GameState';

export const useGamePieces = () => useGameStore((state: GameState) => state.gamePieces);
export const useSelectedPiece = () => useGameStore((state: GameState) => state.selectedPiece);
export const useSelectedCharacter = () => useGameStore((state: GameState) => state.selectedCharacter);
export const useIsPlayerTurn = () => useGameStore((state: GameState) => state.isPlayerTurn);
export const useIsMoving = () => useGameStore((state: GameState) => state.isMoving);
export const useCharacterState = () => useGameStore((state: GameState) => state.characterState);
export const useBoardState = () => useGameStore((state: GameState) => ({
  boardSize: state.boardSize,
  navMatrix: state.navMatrix,
  boardTextures: state.boardTextures,
  generatedImage: state.generatedImage,
}));
export const useUIState = () => useGameStore((state: GameState) => ({
  sidebarOpen: state.sidebarOpen,
  showCharacterSelection: state.showCharacterSelection,
  showMetadataUploader: state.showMetadataUploader,
  showAPIConfigPanel: state.showAPIConfigPanel,
}));
export const useAssetState = () => useGameStore((state: GameState) => ({
  assetUrls: state.assetUrls,
  assetsLoading: state.assetsLoading,
  isGenerating: state.isGenerating,
  generationProgress: state.generationProgress,
  generationError: state.generationError,
}));
export const useAudioState = () => useGameStore((state: GameState) => ({
  soundEnabled: state.soundEnabled,
  musicEnabled: state.musicEnabled,
  soundVolume: state.soundVolume,
  musicVolume: state.musicVolume,
}));