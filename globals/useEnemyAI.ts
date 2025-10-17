import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from './zustand';

export const useEnemyAI = () => {
  let storeState;
  try {
    storeState = useGameStore();
  } catch (error) {
    console.warn('Failed to access game store:', error);
    return {
      isEnemyTurn: false,
      triggerEnemyTurn: () => {},
    };
  }

  const {
    gamePieces,
    isPlayerTurn,
    isMoving,
    enemyAI,
    isEnemyTurn,
    initializeEnemyAI,
    setIsEnemyTurn,
    executeEnemyTurn,
    completeEnemyMoves,
    nextTurn,
    setIsMoving,
    setCharacterState,
  } = storeState;

  const enemyTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    try {
      initializeEnemyAI();
    } catch (error) {
      console.warn('Failed to initialize enemy AI:', error);
    }
  }, [initializeEnemyAI]);

  const handleEnemyTurn = useCallback(() => {
    try {
      console.log('🔄 handleEnemyTurn called with state:', { isPlayerTurn, isMoving, hasEnemyAI: !!enemyAI });
      
      if (isPlayerTurn || isMoving || !enemyAI) {
        console.log('❌ Enemy turn blocked:', { isPlayerTurn, isMoving, hasEnemyAI: !!enemyAI });
        return;
      }

      const enemyPieces = gamePieces.filter(piece => piece.isEnemy);
      if (enemyPieces.length === 0) {
        console.log('❌ No enemy pieces found, skipping to player turn');
        nextTurn();
        return;
      }

      console.log('🔄 Starting enemy turn...');
      console.log('Enemy pieces:', enemyPieces.map(p => p.id));
      
      setIsEnemyTurn(true);
      setCharacterState('MOVING');

      executeEnemyTurn();

      setIsMoving(true);

      enemyTurnTimeoutRef.current = setTimeout(() => {
        try {
          if (!isMountedRef.current) {
            return;
          }
          
          console.log('✅ Enemy turn completed, finalizing moves');
          console.log('Current state before completion:', { isPlayerTurn, isMoving, isEnemyTurn });
          
          completeEnemyMoves();
          
          console.log('✅ Enemy moves completed and turn switched to player');
        } catch (error) {
          console.warn('Error during enemy turn completion:', error);
          if (isMountedRef.current) {
            console.log('🔄 Error recovery: resetting state...');
            setIsMoving(false);
            setCharacterState('idle');
            setIsEnemyTurn(false);
            nextTurn();
          }
        }
      }, 1000); 

 
    } catch (error) {
      console.warn('Error during enemy turn execution:', error);
    }
  }, [
    isPlayerTurn,
    isMoving,
    enemyAI,
    gamePieces,
    setIsEnemyTurn,
    setIsMoving,
    setCharacterState,
    executeEnemyTurn,
    completeEnemyMoves,
    nextTurn,
  ]);



  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (enemyTurnTimeoutRef.current) {
        clearTimeout(enemyTurnTimeoutRef.current);
      }
    };
  }, []);

  const triggerEnemyTurn = useCallback(() => {
    try {
      console.log('🎯 Manual enemy turn trigger');
      if (!isPlayerTurn && !isMoving) {
        handleEnemyTurn();
      } else {
        console.log('❌ Manual trigger blocked:', { isPlayerTurn, isMoving });
      }
    } catch (error) {
      console.warn('Error in manual enemy turn trigger:', error);
    }
  }, [isPlayerTurn, isMoving, handleEnemyTurn]);

  return {
    isEnemyTurn,
    triggerEnemyTurn,
  };
}; 