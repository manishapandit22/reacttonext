export default async function handler(req, res) {
  const { gameId } = req.query;
  const { method } = req;

  if (!global.gameStates) {
    global.gameStates = new Map();
  }

  switch (method) {
    case 'GET':
      try {
        const gameState = global.gameStates.get(gameId) || getDefaultGameState();
        res.status(200).json({
          success: true,
          data: gameState
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch game state'
        });
      }
      break;

    case 'POST':
      try {
        const gameState = req.body.gameState || getDefaultGameState();
        global.gameStates.set(gameId, {
          ...gameState,
          lastUpdated: new Date().toISOString(),
          gameId
        });
        
        res.status(200).json({
          success: true,
          data: global.gameStates.get(gameId)
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to update game state'
        });
      }
      break;

    case 'PUT':
      try {
        const currentState = global.gameStates.get(gameId) || getDefaultGameState();
        const updates = req.body;
        
        const updatedState = {
          ...currentState,
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        
        global.gameStates.set(gameId, updatedState);
        
        res.status(200).json({
          success: true,
          data: updatedState
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to update game state'
        });
      }
      break;

    case 'DELETE':
      try {
        global.gameStates.delete(gameId);
        res.status(200).json({
          success: true,
          message: 'Game state deleted'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete game state'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

function getDefaultGameState() {
  return {
    navigationMatrix: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    ],
    gamePieces: [
      {
        id: "knight1",
        modelPath: "/untitled.glb",
        gridPosition: [4, 2],
        elevation: 0,
        targetPosition: null,
        isEnemy: false,
        speechText: "I stand ready to defend our kingdom!",
        voiceURI: null,
      },
      {
        id: "wolf1",
        modelPath: "/wolf.glb",
        gridPosition: [5, 1],
        elevation: 0,
        targetPosition: null,
        isEnemy: false,
        speechText: "Grrrr... I smell danger nearby.",
        voiceURI: null,
      },
      {
        id: "enemy1",
        modelPath: "/enemy.glb",
        gridPosition: [4, 4],
        elevation: 0,
        targetPosition: null,
        isEnemy: true,
        speechText: "Your kingdom will fall by my hand!",
        voiceURI: null,
      },
      {
        id: "arrow",
        modelPath: "/erika.glb",
        gridPosition: [2, 3],
        elevation: 0,
        targetPosition: null,
        isEnemy: true,
        speechText: "My arrows never miss their target.",
        voiceURI: null,
      },
      {
        id: "tula",
        modelPath: "/tula1.glb",
        gridPosition: [2, 6],
        elevation: 1,
        targetPosition: null,
        isEnemy: true,
        speechText: "I have been watching you from the shadows. Your moves are predictable.",
        voiceURI: null,
      },
    ],
    selectedPiece: null,
    highlightedCells: [],
    isPlayerTurn: true,
    isMoving: false,
    characterState: "idle",
    attackTargetId: null,
    selectedCharacter: null,
    gameStatus: "active", 
    turnCount: 0,
    lastAction: null,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}