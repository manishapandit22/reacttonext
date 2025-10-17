import React from 'react';
import { useGameStore } from '../globals/zustand';
import { useEnemyAI } from '../globals/useEnemyAI';

export const EnemyAITest: React.FC = () => {
  const { gamePieces, isPlayerTurn, isMoving, isEnemyTurn, enemyAI } = useGameStore();
  const { triggerEnemyTurn } = useEnemyAI();

  const enemyPieces = gamePieces.filter(piece => piece.isEnemy);
  const playerPieces = gamePieces.filter(piece => !piece.isEnemy);

  const ids = gamePieces.map(piece => piece.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const hasDuplicates = duplicates.length > 0;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg font-mono text-sm">
      <h3 className="font-bold mb-2">Enemy AI Debug</h3>
      <div className="space-y-1">
        <div>Player Turn: {isPlayerTurn ? '✅' : '❌'}</div>
        <div>Moving: {isMoving ? '✅' : '❌'}</div>
        <div>Enemy Turn: {isEnemyTurn ? '✅' : '❌'}</div>
        <div>Enemy AI: {enemyAI ? '✅' : '❌'}</div>
        <div>Enemy Pieces: {enemyPieces.length}</div>
        <div>Player Pieces: {playerPieces.length}</div>
        <div className={`${hasDuplicates ? 'text-red-400' : 'text-green-400'}`}>
          Duplicates: {hasDuplicates ? `❌ ${duplicates.join(', ')}` : '✅ None'}
        </div>
      </div>
      
      <div className="mt-3">
        <button
          onClick={triggerEnemyTurn}
          disabled={isPlayerTurn || isMoving}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-xs"
        >
          Trigger Enemy Turn
        </button>
      </div>

      <div className="mt-3 text-xs">
        <div className="font-bold">Enemy Pieces:</div>
        {enemyPieces.map(piece => (
          <div key={piece.id} className="ml-2">
            {piece.id}: [{piece.gridPosition[0]}, {piece.gridPosition[1]}]
            {piece.targetPosition && ` → [${piece.targetPosition[0]}, ${piece.targetPosition[1]}]`}
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs">
        <div className="font-bold">Player Pieces:</div>
        {playerPieces.map(piece => (
          <div key={piece.id} className="ml-2">
            {piece.id}: [{piece.gridPosition[0]}, {piece.gridPosition[1]}]
          </div>
        ))}
      </div>

      {hasDuplicates && (
        <div className="mt-2 text-xs text-red-400">
          <div className="font-bold">⚠️ Duplicate IDs Found:</div>
          {duplicates.map(id => (
            <div key={id} className="ml-2">• {id}</div>
          ))}
        </div>
      )}
    </div>
  );
}; 