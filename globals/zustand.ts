import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GameState } from '../interface/GameState';
import type { GamePiece } from '../interface/GamePiece';
import type { Character } from '../interface/Common';
import { EnemyAI, type EnemyAIDecision } from '../lib/EnemyAI';

const defaultNavMatrix = Array(10).fill(null).map(() => Array(10).fill(1));

const initialState = {
  boardSize: 10,
  cellSize: 1,
  navMatrix: defaultNavMatrix,
  boardTextures: {
    baseTexture: null,
    heightTexture: null,
    normalTexture: null,
  },
  boardInfo: {
    gridSize: 10,
    walkableTiles: 100,
    totalTiles: 100,
  },
  generatedImage: '',
  environment: null,

  gamePieces: [],
  selectedPiece: null,
  highlightedCells: [],
  selectedCharacter: null,
  availableCharacters: [],

  isPlayerTurn: true,
  isMoving: false,
  characterState: 'idle' as const,
  attackTargetId: null,
  gamePhase: 'setup' as const,
  turnCount: 0,

  sidebarOpen: true,
  showCharacterSelection: false,
  showMetadataUploader: false,
  showAPIConfigPanel: false,
  isSpeaking: false,

  assetUrls: {},
  assetsLoading: false,
  isGenerating: false,
  generationProgress: 0,
  generationError: null,

  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.5,
  musicVolume: 0.3,

  enemyAI: null as EnemyAI | null,
  isEnemyTurn: false,
  enemyDecisions: new Map<string, EnemyAIDecision>(),
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        setBoardSize: (size: number) => set((state) => {
          state.boardSize = size;
          if (state.enemyAI) {
            state.enemyAI = new EnemyAI(state.navMatrix, size);
          }
        }),

        setNavMatrix: (matrix: number[][]) => set((state) => {
          state.navMatrix = matrix;
          if (state.enemyAI) {
            state.enemyAI.updateNavMatrix(matrix);
          } else {
            state.enemyAI = new EnemyAI(matrix, state.boardSize);
          }
        }),

        setBoardTextures: (textures: Partial<GameState['boardTextures']>) => set((state) => {
          Object.assign(state.boardTextures, textures);
        }),

        setBoardInfo: (info: Partial<GameState['boardInfo']>) => set((state) => {
          Object.assign(state.boardInfo, info);
        }),

        setGeneratedImage: (url: string) => set((state) => {
          state.generatedImage = url;
        }),

        setEnvironment: (texture: any | null) => set((state) => {
          state.environment = texture;
        }),

        addGamePiece: (piece: GamePiece) => set((state) => {
          console.log('Adding piece to store:', piece.id, piece.isEnemy, piece.gridPosition);
          state.gamePieces.push(piece);
          console.log('Total pieces in store:', state.gamePieces.length);
        }),

        removeGamePiece: (id: string) => set((state) => {
          state.gamePieces = state.gamePieces.filter((piece: GamePiece) => piece.id !== id);
        }),

        updateGamePiece: (id: string, updates: Partial<GamePiece>) => set((state) => {
          const pieceIndex = state.gamePieces.findIndex((piece: GamePiece) => piece.id === id);
          if (pieceIndex !== -1) {
            Object.assign(state.gamePieces[pieceIndex], updates);
          }
        }),

        moveGamePiece: (id: string, newPosition: [number, number]) => set((state) => {
          const pieceIndex = state.gamePieces.findIndex((piece: any) => piece.id === id);
          if (pieceIndex !== -1) {
            state.gamePieces[pieceIndex].gridPosition = newPosition;
            state.gamePieces[pieceIndex].targetPosition = null;
          }
        }),

        setSelectedPiece: (position: [number, number] | null) => set((state) => {
          state.selectedPiece = position;
          if (position) {
            const character = state.gamePieces.find(
              (piece: GamePiece) => piece.gridPosition[0] === position[0] && 
                      piece.gridPosition[1] === position[1]
            );
            state.selectedCharacter = character || null;
          } else {
            state.selectedCharacter = null;
          }
        }),

        setHighlightedCells: (cells: [number, number][]) => set((state) => {
          state.highlightedCells = cells;
        }),

        setSelectedCharacter: (character: GamePiece | null) => set((state) => {
          state.selectedCharacter = character;
        }),

        setAvailableCharacters: (characters: Character[]) => set((state) => {
          state.availableCharacters = characters;
        }),

        setIsPlayerTurn: (isPlayerTurn: boolean) => set((state) => {
          state.isPlayerTurn = isPlayerTurn;
        }),

        setIsMoving: (isMoving: boolean) => set((state) => {
          state.isMoving = isMoving;
        }),

        setCharacterState: (characterState: 'idle' | 'MOVING' | 'attack' | 'RANGED' | 'SPEAKING') => set((state) => {
          state.characterState = characterState;
        }),

        setAttackTargetId: (id: string | null) => set((state) => {
          state.attackTargetId = id;
        }),

        setGamePhase: (phase: 'setup' | 'playing' | 'paused' | 'ended') => set((state) => {
          state.gamePhase = phase;
        }),

        nextTurn: () => set((state) => {
          state.turnCount += 1;
          state.isPlayerTurn = !state.isPlayerTurn;
          state.selectedPiece = null;
          state.highlightedCells = [];
          state.selectedCharacter = null;
        }),

        resetGame: () => set((state) => {
          Object.assign(state, initialState);
        }),

        setSidebarOpen: (open: boolean) => set((state) => {
          state.sidebarOpen = open;
        }),

        setShowCharacterSelection: (show: boolean) => set((state) => {
          state.showCharacterSelection = show;
        }),

        setShowMetadataUploader: (show: boolean) => set((state) => {
          state.showMetadataUploader = show;
        }),

        setShowAPIConfigPanel: (show: boolean) => set((state) => {
          state.showAPIConfigPanel = show;
        }),

        setIsSpeaking: (speaking: boolean) => set((state) => {
          state.isSpeaking = speaking;
        }),

        setAssetUrls: (urls: Partial<GameState['assetUrls']>) => set((state) => {
          Object.assign(state.assetUrls, urls);
        }),

        setAssetsLoading: (loading: boolean) => set((state) => {
          state.assetsLoading = loading;
        }),

        setIsGenerating: (generating: boolean) => set((state) => {
          state.isGenerating = generating;
        }),

        setGenerationProgress: (progress: number) => set((state) => {
          state.generationProgress = progress;
        }),

        setGenerationError: (error: string | null) => set((state) => {
          state.generationError = error;
        }),

        setSoundEnabled: (enabled: boolean) => set((state) => {
          state.soundEnabled = enabled;
        }),

        setMusicEnabled: (enabled: boolean) => set((state) => {
          state.musicEnabled = enabled;
        }),

        setSoundVolume: (volume: number) => set((state) => {
          state.soundVolume = Math.max(0, Math.min(1, volume));
        }),

        setMusicVolume: (volume: number) => set((state) => {
          state.musicVolume = Math.max(0, Math.min(1, volume));
        }),

        findValidPositions: (): [number, number][] => {
          const state = get();
          const positions: [number, number][] = [];
          for (let z = 0; z < state.navMatrix.length; z++) {
            for (let x = 0; x < state.navMatrix[z].length; x++) {
              if (state.navMatrix[z][x] === 1) {
                positions.push([x, z]);
              }
            }
          }
          return positions;
        },

        getSurroundingCells: (gridPos: [number, number]) => {
          const state = get();
          const [x, z] = gridPos;
          const surroundingCells: [number, number][] = [];

          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;

              const newX = x + i;
              const newZ = z + j;

              if (
                newX >= 0 && newX < state.boardSize && 
                newZ >= 0 && newZ < state.boardSize &&
                state.navMatrix[newZ][newX] === 1 
              ) {
                const isOccupied = state.gamePieces.some(
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

        findClosestEnemy: (attackerPos: [number, number]) => {
          try {
            const state = get();
            const attackerPiece = state.gamePieces.find(
              (piece: GamePiece) =>
                piece.gridPosition[0] === attackerPos[0] &&
                piece.gridPosition[1] === attackerPos[1]
            );
            if (!attackerPiece) return null;

            let closestEnemy: GamePiece | null | any = null;
            let minDistance = Infinity;

            state.gamePieces.forEach((piece: GamePiece) => {
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

            return closestEnemy ? closestEnemy.id : null;
          } catch (error) {
            console.warn('Failed to find closest enemy:', error);
            return null;
          }
        },

        isPieceAt: (position: [number, number]) => {
          try {
            const state = get();
            return state.gamePieces.find(
              (piece: GamePiece) => piece.gridPosition[0] === position[0] && 
                      piece.gridPosition[1] === position[1]
            ) || null;
          } catch (error) {
            console.warn('Failed to check if piece is at position:', error);
            return null;
          }
        },

        isValidMove: (fromPos: [number, number], toPos: [number, number]) => {
          try {
            const state = get();
            const [toX, toZ] = toPos;
            
            if (toX < 0 || toX >= state.boardSize || toZ < 0 || toZ >= state.boardSize) {
              return false;
            }
            
            if (state.navMatrix[toZ][toX] !== 1) {
              return false;
            }
            
            const isOccupied = state.gamePieces.some(
              (piece: GamePiece) => piece.gridPosition[0] === toX && piece.gridPosition[1] === toZ
            );
            
            return !isOccupied;
          } catch (error) {
            console.warn('Failed to validate move:', error);
            return false;
          }
        },

        initializeEnemyAI: () => {
          try {
            console.log('🔄 initializeEnemyAI called');
            set((state) => {
              if (!state.enemyAI) {
                console.log('Creating new EnemyAI instance');
                state.enemyAI = new EnemyAI(state.navMatrix, state.boardSize);
                console.log('EnemyAI created successfully');
              } else {
                console.log('EnemyAI already exists');
              }
            });
          } catch (error) {
            console.warn('Failed to initialize enemy AI in store:', error);
          }
        },

        setIsEnemyTurn: (isEnemyTurn: boolean) => set((state) => {
          state.isEnemyTurn = isEnemyTurn;
        }),

        setEnemyDecisions: (decisions: Map<string, EnemyAIDecision>) => set((state) => {
          state.enemyDecisions = decisions;
        }),

        executeEnemyTurn: () => {
          try {
            const state = get();
            console.log('🔄 executeEnemyTurn called');
            console.log('enemyAI exists:', !!state.enemyAI);
            console.log('isPlayerTurn:', state.isPlayerTurn);
            console.log('isMoving:', state.isMoving);
            console.log('Total game pieces:', state.gamePieces.length);
            
            if (!state.enemyAI || state.isPlayerTurn) {
              console.log('❌ executeEnemyTurn early return');
              return;
            }

            const enemyPieces = state.gamePieces.filter(piece => piece.isEnemy);
            console.log('Enemy pieces found:', enemyPieces.length);
            
            if (enemyPieces.length === 0) {
              console.log('❌ No enemy pieces found');
              return;
            }

            const decisions = state.enemyAI.executeEnemyActions(state.gamePieces);
            console.log('Enemy decisions:', decisions);
            
            set((state) => {
              state.enemyDecisions = decisions;

              let moveCount = 0;
              decisions.forEach((decision, enemyId) => {
                console.log(`Decision for ${enemyId}:`, decision);
                
                if (decision.type === 'move' && decision.targetPosition) {
                  const pieceIndex = state.gamePieces.findIndex(piece => piece.id === enemyId);
                  if (pieceIndex !== -1) {
                    const updatedPiece = {
                      ...state.gamePieces[pieceIndex],
                      targetPosition: decision.targetPosition,
                      targetWorldPosition: (() => {
                        const centerOffset = state.boardSize / 2;
                        return [
                          (decision.targetPosition[0] - centerOffset) * state.cellSize,
                          state.gamePieces[pieceIndex].elevation,
                          (decision.targetPosition[1] - centerOffset) * state.cellSize
                        ] as [number, number, number];
                      })()
                    };
                    
                    state.gamePieces[pieceIndex] = updatedPiece;
                    
                    console.log(`Set target position for ${enemyId}:`, decision.targetPosition);
                    console.log(`World position:`, updatedPiece.targetWorldPosition);
                    moveCount++;
                  }
                } else if (decision.type === 'attack' && decision.targetPiece) {
                  console.log(`${enemyId} is attacking ${decision.targetPiece.id}`);
                }
              });

              console.log(`Total enemy moves queued: ${moveCount}`);
            });
          } catch (error) {
            console.warn('Failed to execute enemy turn:', error);
          }
        },

        completeEnemyMoves: () => {
          try {
            console.log('🔄 completeEnemyMoves called');
            set((state) => {
              console.log('🔄 Processing enemy pieces for move completion...');
              const enemyPieces = state.gamePieces.filter(piece => piece.isEnemy);
              console.log('🔄 Enemy pieces found:', enemyPieces.map(p => ({ id: p.id, targetPosition: p.targetPosition, targetWorldPosition: p.targetWorldPosition })));
              
              state.gamePieces = state.gamePieces.map(piece => {
                if (piece.isEnemy && (piece.targetPosition || piece.targetWorldPosition)) {
                  let newGridPosition = piece.gridPosition;
                  
                  if (piece.targetPosition) {
                    newGridPosition = piece.targetPosition;
                    console.log(`Completing move for ${piece.id}: ${piece.gridPosition} -> ${piece.targetPosition}`);
                  } else if (piece.targetWorldPosition) {
                    const centerOffset = state.boardSize / 2;
                    const gridX = Math.round(piece.targetWorldPosition[0] / state.cellSize + centerOffset);
                    const gridZ = Math.round(piece.targetWorldPosition[2] / state.cellSize + centerOffset);
                    newGridPosition = [gridX, gridZ] as [number, number];
                    console.log(`Completing move for ${piece.id}: ${piece.gridPosition} -> [${gridX}, ${gridZ}] (from world position)`);
                  }
                  
                  return {
                    ...piece,
                    gridPosition: newGridPosition,
                    targetPosition: null,
                    targetWorldPosition: null
                  };
                }
                return piece;
              });
              
              state.isMoving = false;
              state.isEnemyTurn = false;
              state.isPlayerTurn = true;
              state.characterState = 'idle';
              state.selectedPiece = null;
              state.highlightedCells = [];
              
              console.log('✅ Enemy moves completed successfully, switched to player turn');
            });
          } catch (error) {
            console.warn('Failed to complete enemy moves:', error);
          }
        },
      })),
      {
        name: 'rpg-game-store',
        partialize: (state) => ({
          boardSize: state.boardSize,
          navMatrix: state.navMatrix,
          boardInfo: state.boardInfo,
          generatedImage: state.generatedImage,
          soundEnabled: state.soundEnabled,
          musicEnabled: state.musicEnabled,
          soundVolume: state.soundVolume,
          musicVolume: state.musicVolume,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'rpg-game-store',
    }
  )
);