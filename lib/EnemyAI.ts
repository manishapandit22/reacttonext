import { PathFinder } from './PathFind';
import type { GamePiece } from '@/types';

export interface EnemyAIDecision {
  type: 'move' | 'attack' | 'idle';
  targetPosition?: [number, number];
  targetPiece?: GamePiece;
  path?: [number, number][];
  priority?: number; 
}

export class EnemyAI {
  private pathFinder: PathFinder;
  private navMatrix: number[][];
  private boardSize: number;

  constructor(navMatrix: number[][], boardSize: number) {
    this.navMatrix = navMatrix;
    this.boardSize = boardSize;
    this.pathFinder = new PathFinder(navMatrix);
  }

  updateNavMatrix(newNavMatrix: number[][]) {
    this.navMatrix = newNavMatrix;
    this.pathFinder = new PathFinder(newNavMatrix);
  }

  getEnemyAction(enemyPiece: GamePiece, allPieces: GamePiece[]): EnemyAIDecision {
    const playerPieces = allPieces.filter(piece => !piece.isEnemy);
    if (playerPieces.length === 0) {
      return { type: 'idle', priority: 0 };
    }

    const closestPlayer = this.findClosestPlayer(enemyPiece, playerPieces);
    if (!closestPlayer) {
      return { type: 'idle', priority: 0 };
    }

    const distance = this.calculateDistance(enemyPiece.gridPosition, closestPlayer.gridPosition);
    
    if (distance <= 1.5) {
      return {
        type: 'attack',
        targetPiece: closestPlayer,
        priority: 10
      };
    }

    // Try pathfinding first
    const path = this.pathFinder.getFullPath(enemyPiece.gridPosition, closestPlayer.gridPosition);
    
    if (path && path.length > 1) {
      const nextPosition = path[1];
      
      if (this.isValidMove(enemyPiece.gridPosition, nextPosition, allPieces)) {
        return {
          type: 'move',
          targetPosition: nextPosition,
          targetPiece: closestPlayer,
          path: path,
          priority: 8
        };
      }
    }

    // If pathfinding fails, try to find the closest walkable position to the player
    const closestWalkablePosition = this.findClosestWalkablePosition(closestPlayer.gridPosition);
    if (closestWalkablePosition) {
      const pathToWalkable = this.pathFinder.getFullPath(enemyPiece.gridPosition, closestWalkablePosition);
      
      if (pathToWalkable && pathToWalkable.length > 1) {
        const nextPosition = pathToWalkable[1];
        
        if (this.isValidMove(enemyPiece.gridPosition, nextPosition, allPieces)) {
          return {
            type: 'move',
            targetPosition: nextPosition,
            targetPiece: closestPlayer,
            path: pathToWalkable,
            priority: 7
          };
        }
      }
    }

    // Fallback to direct movement
    const direction = this.getDirectionTowards(enemyPiece.gridPosition, closestPlayer.gridPosition);
    const possibleMoves = this.getValidMovesInDirection(enemyPiece.gridPosition, direction, allPieces);
    
    if (possibleMoves.length > 0) {
      const bestMove = possibleMoves.reduce((best, move) => {
        const bestDistance = this.calculateDistance(best, closestPlayer.gridPosition);
        const moveDistance = this.calculateDistance(move, closestPlayer.gridPosition);
        return moveDistance < bestDistance ? move : best;
      });
      
      return {
        type: 'move',
        targetPosition: bestMove,
        targetPiece: closestPlayer,
        priority: 6
      };
    }

    const adjacentMoves = this.getAdjacentValidMoves(enemyPiece.gridPosition, allPieces);
    if (adjacentMoves.length > 0) {
      const bestMove = adjacentMoves.reduce((best, move) => {
        const bestDistance = this.calculateDistance(best, closestPlayer.gridPosition);
        const moveDistance = this.calculateDistance(move, closestPlayer.gridPosition);
        return moveDistance < bestDistance ? move : best;
      });
      
      return {
        type: 'move',
        targetPosition: bestMove,
        targetPiece: closestPlayer,
        priority: 4
      };
    }

    return { type: 'idle', priority: 0 };
  }

  getAllEnemyActions(allPieces: GamePiece[]): Map<string, EnemyAIDecision> {
    const enemyPieces = allPieces.filter(piece => piece.isEnemy);
    const decisions = new Map<string, EnemyAIDecision>();

    enemyPieces.forEach(enemy => {
      decisions.set(enemy.id, this.getEnemyAction(enemy, allPieces));
    });

    return decisions;
  }

  executeEnemyActions(allPieces: GamePiece[]): Map<string, EnemyAIDecision> {
    const decisions = this.getAllEnemyActions(allPieces);
    
    const sortedDecisions = Array.from(decisions.entries())
      .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0));
    
    const sortedMap = new Map(sortedDecisions);
    
    return sortedMap;
  }

  private getAdjacentValidMoves(position: [number, number], allPieces: GamePiece[]): [number, number][] {
    const [x, z] = position;
    const validMoves: [number, number][] = [];
    
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0] 
    ];
    
    for (const [dx, dz] of directions) {
      const newX = x + dx;
      const newZ = z + dz;
      const newPos: [number, number] = [newX, newZ];
      
      if (this.isValidMove(position, newPos, allPieces)) {
        validMoves.push(newPos);
      }
    }
    
    return validMoves;
  }

  private findClosestPlayer(enemyPiece: GamePiece, playerPieces: GamePiece[]): GamePiece | null {
    let closestPlayer: GamePiece | null = null;
    let minDistance = Infinity;

    playerPieces.forEach(player => {
      const distance = this.calculateDistance(enemyPiece.gridPosition, player.gridPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    });

    return closestPlayer;
  }

  private calculateDistance(pos1: [number, number], pos2: [number, number]): number {
    return Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
    );
  }

  private isValidMove(fromPos: [number, number], toPos: [number, number], allPieces: GamePiece[]): boolean {
    const [toX, toZ] = toPos;
    
    if (toX < 0 || toX >= this.boardSize || toZ < 0 || toZ >= this.boardSize) {
      return false;
    }
    
    if (this.navMatrix[toZ][toX] !== 1) {
      return false;
    }
    
    const isOccupied = allPieces.some(piece => 
      piece.gridPosition[0] === toX && piece.gridPosition[1] === toZ
    );
    
    return !isOccupied;
  }

  private getDirectionTowards(fromPos: [number, number], toPos: [number, number]): [number, number] {
    const dx = toPos[0] - fromPos[0];
    const dz = toPos[1] - fromPos[1];
    
    const length = Math.sqrt(dx * dx + dz * dz);
    if (length === 0) return [0, 0];
    
    return [dx / length, dz / length];
  }

  private getValidMovesInDirection(
    currentPos: [number, number], 
    direction: [number, number], 
    allPieces: GamePiece[]
  ): [number, number][] {
    const moves: [number, number][] = [];
    const [dx, dz] = direction;
    
    for (let i = 1; i <= 3; i++) {
      const newX = currentPos[0] + (dx * i);
      const newZ = currentPos[1] + (dz * i);
      const newPos: [number, number] = [newX, newZ];
      
      if (this.isValidMove(currentPos, newPos, allPieces)) {
        moves.push(newPos);
      } else {
        break;
      }
    }
    
    return moves;
  }

  private findClosestWalkablePosition(targetPos: [number, number]): [number, number] | null {
    // If the target position is already walkable, return it
    if (this.isValidPosition(targetPos)) {
      return targetPos;
    }

    // Search in expanding circles around the target position
    const maxRadius = Math.min(this.boardSize, 10); // Limit search radius
    
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          // Only check positions at the current radius
          if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
            const newX = targetPos[0] + dx;
            const newZ = targetPos[1] + dz;
            const newPos: [number, number] = [newX, newZ];
            
            if (this.isValidPosition(newPos)) {
              return newPos;
            }
          }
        }
      }
    }
    
    return null;
  }

  private isValidPosition(pos: [number, number]): boolean {
    const [x, z] = pos;
    return (
      x >= 0 && x < this.boardSize &&
      z >= 0 && z < this.boardSize &&
      this.navMatrix[z] && this.navMatrix[z][x] === 1
    );
  }

  getPathToTarget(fromPos: [number, number], toPos: [number, number]): [number, number][] | null {
    return this.pathFinder.getFullPath(fromPos, toPos);
  }

  getNextMoveTowards(fromPos: [number, number], toPos: [number, number]): [number, number] | null {
    return this.pathFinder.getNextMove(fromPos, toPos);
  }
} 