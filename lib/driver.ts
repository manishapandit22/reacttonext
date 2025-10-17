import {PathFinder} from "./PathFind.ts"

const navMatrix = [
  [1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1]
];

const pathfinder = new PathFinder(navMatrix);

const enemyPosition: [number, number] = [0, 0];
const playerPosition: [number, number] = [4, 4];

const nextMove = pathfinder.getNextMove(enemyPosition, playerPosition);
if (nextMove) {
  console.log(`Enemy should move to: ${nextMove[0]}, ${nextMove[1]}`);
} else {
  console.log("No valid path found");
}

const fullPath = pathfinder.getFullPath(enemyPosition, playerPosition);
if (fullPath) {
  console.log("Full path:", fullPath);
}