import { useState, useEffect, useCallback, useRef } from 'react';

export const useGameSync = (gameId, options = {}) => {
  const {
    autoSync = true,
    syncInterval = 5000, 
    enableRealtime = false 
  } = options;

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  const syncIntervalRef = useRef(null);
  const lastSyncTime = useRef(null);

  const fetchGameState = useCallback(async () => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/game/${gameId}`);
      const result = await response.json();
      
      if (result.success) {
        setGameState(result.data);
        setError(null);
        lastSyncTime.current = new Date().toISOString();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to fetch game state:', err);
      setError('Failed to fetch game state');
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [gameId]);

  const updateGameState = useCallback(async (updates) => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/game/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGameState(result.data);
        setError(null);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to update game state:', err);
      setError('Failed to update game state');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [gameId]);

  const movePiece = useCallback(async (pieceId, fromPosition, toPosition, playerId = 'player1') => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/game/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pieceId,
          fromPosition,
          toPosition,
          playerId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGameState(result.data.gameState);
        setError(null);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to move piece:', err);
      setError('Failed to move piece');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [gameId]);

  const attackPiece = useCallback(async (attackerId, targetId, attackType, playerId = 'player1') => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/game/${gameId}/attack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attackerId,
          targetId,
          attackType,
          playerId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGameState(result.data.gameState);
        setError(null);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to attack:', err);
      setError('Failed to attack');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [gameId]);

  const initializeGame = useCallback(async (initialState = null) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/game/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameState: initialState
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGameState(result.data);
        setError(null);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError('Failed to initialize game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const forceSync = useCallback(() => {
    fetchGameState();
  }, [fetchGameState]);

  useEffect(() => {
    if (autoSync && gameId) {
      fetchGameState();
      
      syncIntervalRef.current = setInterval(fetchGameState, syncInterval);
      
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [autoSync, gameId, syncInterval, fetchGameState]);

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    gameState,
    loading,
    error,
    syncing,
    
    updateGameState,
    movePiece,
    attackPiece,
    initializeGame,
    forceSync,
    
    isConnected: !error && gameState !== null,
    lastSync: lastSyncTime.current
  };
};