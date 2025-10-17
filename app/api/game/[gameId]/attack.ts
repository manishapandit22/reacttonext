export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { gameId } = req.query;
  const { attackerId, targetId, attackType, playerId } = req.body; 

  try {
    if (!attackerId || !targetId || !attackType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: attackerId, targetId, attackType'
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

    const validationResult = validateAttack(gameState, attackerId, targetId, attackType);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    const attackResult = processAttack(gameState, attackerId, targetId, attackType);
    
    const updatedGameState = {
      ...gameState,
      ...attackResult.gameStateUpdates,
      lastAction: {
        type: 'attack',
        attackerId,
        targetId,
        attackType,
        damage: attackResult.damage,
        hit: attackResult.hit,
        timestamp: new Date().toISOString(),
        playerId
      },
      turnCount: gameState.turnCount + 1,
      lastUpdated: new Date().toISOString()
    };

    global.gameStates.set(gameId, updatedGameState);

    res.status(200).json({
      success: true,
      data: {
        gameState: updatedGameState,
        attackResult: {
          hit: attackResult.hit,
          damage: attackResult.damage,
          targetDestroyed: attackResult.targetDestroyed
        }
      }
    });

  } catch (error) {
    console.error('Attack API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process attack'
    });
  }
}

function validateAttack(gameState, attackerId, targetId, attackType) {
  const { gamePieces } = gameState;
  
  const attacker = gamePieces.find(p => p.id === attackerId);
  const target = gamePieces.find(p => p.id === targetId);
  
  if (!attacker) {
    return { valid: false, error: 'Attacker piece not found' };
  }
  
  if (!target) {
    return { valid: false, error: 'Target piece not found' };
  }

  if (attacker.isEnemy === target.isEnemy) {
    return { valid: false, error: 'Cannot attack allied piece' };
  }

  const distance = Math.sqrt(
    Math.pow(target.gridPosition[0] - attacker.gridPosition[0], 2) +
    Math.pow(target.gridPosition[1] - attacker.gridPosition[1], 2)
  );

  if (attackType === 'melee' && distance > 1.5) {
    return { valid: false, error: 'Target too far for melee attack' };
  }
  
  if (attackType === 'ranged' && distance > 4) {
    return { valid: false, error: 'Target too far for ranged attack' };
  }

  return { valid: true };
}

function processAttack(gameState, attackerId, targetId, attackType) {
  const { gamePieces } = gameState;
  
  const hitChance = attackType === 'melee' ? 0.8 : 0.7;
  const baseDamage = attackType === 'melee' ? 25 : 20;
  
  const hit = Math.random() < hitChance;
  const damage = hit ? baseDamage + Math.floor(Math.random() * 10) : 0;
  
  let gameStateUpdates = {};
  let targetDestroyed = false;

  if (hit && damage > 0) {
    const destructionChance = 0.3;
    targetDestroyed = Math.random() < destructionChance;
    
    if (targetDestroyed) {
      gameStateUpdates.gamePieces = gamePieces.filter(p => p.id !== targetId);
    }
  }

  return {
    hit,
    damage,
    targetDestroyed,
    gameStateUpdates
  };
}