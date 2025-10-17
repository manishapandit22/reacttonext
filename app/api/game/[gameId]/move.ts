export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { gameId } = req.query;
  const { pieceId, fromPosition, toPosition, playerId } = req.body;

  try {
    if (!pieceId || !fromPosition || !toPosition) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pieceId, fromPosition, toPosition'
      });
    }

    if (!global.gameStates) {
      global.gameStates = new Map();
    }

    const gameState = global.gameStates.get(gameId);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    const validationResult = validateMove(gameState, pieceId, fromPosition, toPosition);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    const updatedGameState = updatePiecePosition(gameState, pieceId, toPosition);
    
    updatedGameState.lastAction = {
      type: 'move',
      pieceId,
      fromPosition,
      toPosition,
      timestamp: new Date().toISOString(),
      playerId
    };
    
    updatedGameState.turnCount += 1;
    updatedGameState.lastUpdated = new Date().toISOString();

    global.gameStates.set(gameId, updatedGameState);

    res.status(200).json({
      success: true,
      data: {
        gameState: updatedGameState,
        move: updatedGameState.lastAction
      }
    });

  } catch (error) {
    console.error('Move API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process move'
    });
  }
}

function validateMove(gameState, pieceId, fromPosition, toPosition) {
  const { gamePieces, navigationMatrix } = gameState;
  
  const piece = gamePieces.find(p => p.id === pieceId);
  if (!piece) {
    return { valid: false, error: 'Piece not found' };
  }

  if (piece.gridPosition[0] !== fromPosition[0] || piece.gridPosition[1] !== fromPosition[1]) {
    return { valid: false, error: 'Piece not at expected position' };
  }

  if (toPosition[0] < 0 || toPosition[0] >= 10 || toPosition[1] < 0 || toPosition[1] >= 10) {
    return { valid: false, error: 'Move out of bounds' };
  }

  if (navigationMatrix[toPosition[1]][toPosition[0]] !== 1) {
    return { valid: false, error: 'Destination not navigable' };
  }

  const occupiedByOtherPiece = gamePieces.some(p => 
    p.id !== pieceId && 
    p.gridPosition[0] === toPosition[0] && 
    p.gridPosition[1] === toPosition[1]
  );
  
  if (occupiedByOtherPiece) {
    return { valid: false, error: 'Destination occupied' };
  }

  const deltaX = Math.abs(toPosition[0] - fromPosition[0]);
  const deltaY = Math.abs(toPosition[1] - fromPosition[1]);
  
  if (deltaX > 1 || deltaY > 1) {
    return { valid: false, error: 'Move too far - only adjacent cells allowed' };
  }

  return { valid: true };
}

function updatePiecePosition(gameState, pieceId, newPosition) {
  const updatedGameState = { ...gameState };
  const pieceIndex = updatedGameState.gamePieces.findIndex(p => p.id === pieceId);
  
  if (pieceIndex !== -1) {
    updatedGameState.gamePieces = [...updatedGameState.gamePieces];
    updatedGameState.gamePieces[pieceIndex] = {
      ...updatedGameState.gamePieces[pieceIndex],
      gridPosition: newPosition,
      targetPosition: null
    };
  }
  
  return updatedGameState;
}