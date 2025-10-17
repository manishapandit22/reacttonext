// func just for my rememberign => f(n) = f(g)+g(h);
// h is heuristic and g is cost of taking the path

interface Node {
  x: number;
  y: number;
  g: number; //cos form start to this node
  h: number; //heuristic cost from this node to goal
  f: number; //total cots (g + h)
  parent: Node | null;
}

export class PathFinder {
  public cellSize: number | null = null;
  public arrayDimension: number = 0;
  public start: [number, number];
  public stop: [number, number];
  public navMatrix: Array<Array<number>>;
  private openList: Node[] = [];
  private closedList: Set<string> = new Set();

  constructor(navMatrix: Array<Array<number>>) {
    this.navMatrix = navMatrix;
    this.arrayDimension = navMatrix.length;
    this.start = [0, 0];
    this.stop = [this.arrayDimension - 1, this.arrayDimension - 1];
  }

  setStartAndGoal(start: [number, number], goal: [number, number]): void {
    this.start = start;
    this.stop = goal;
  }

  //useing manhatten distance for the heuristic func as it never overestimatess
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private isValidCell(x: number, y: number): boolean {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.arrayDimension &&
      y < this.arrayDimension &&
      this.navMatrix[y][x] === 1
    );
  }

  private coordsToKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private getNeighbors(node: Node): Node[] {
    const neighbors: Node[] = [];
    const directions = [
      [0, 1],  //down
      [1, 0],  //right
      [0, -1], //up
      [-1, 0]  //left
    ];

    for (const [dx, dy] of directions) {
      const newX = node.x + dx;
      const newY = node.y + dy;

      if (this.isValidCell(newX, newY)) {
        neighbors.push({
          x: newX,
          y: newY,
          g: 0,
          h: 0,
          f: 0,
          parent: null
        });
      }
    }

    return neighbors;
  }

  private getLowestFNode(): Node | null {
    if (this.openList.length === 0) return null;
    
    let lowest = this.openList[0];
    let lowestIndex = 0;

    for (let i = 1; i < this.openList.length; i++) {
      if (this.openList[i].f < lowest.f) {
        lowest = this.openList[i];
        lowestIndex = i;
      }
    }

    this.openList.splice(lowestIndex, 1);
    return lowest;
  }

  private isInOpenList(x: number, y: number): Node | null {
    return this.openList.find(node => node.x === x && node.y === y) || null;
  }

  private reconstructPath(goalNode: Node): [number, number][] {
    const path: [number, number][] = [];
    let current: Node | null = goalNode;

    while (current !== null) {
      path.unshift([current.x, current.y]);
      current = current.parent;
    }

    return path;
  }

  findPath(): [number, number][] | null {
    this.openList = [];
    this.closedList = new Set();

    if (!this.isValidCell(this.start[0], this.start[1])) {
      console.warn('Start position is not valid:', this.start);
      return null;
    }

    if (!this.isValidCell(this.stop[0], this.stop[1])) {
      console.warn('Goal position is not valid:', this.stop);
      return null;
    }

    if (this.start[0] === this.stop[0] && this.start[1] === this.stop[1]) {
      return [this.start];
    }

    const startNode: Node = {
      x: this.start[0],
      y: this.start[1],
      g: 0,
      h: this.heuristic(this.start[0], this.start[1], this.stop[0], this.stop[1]),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    this.openList.push(startNode);

    while (this.openList.length > 0) {
      const currentNode = this.getLowestFNode();
      if (!currentNode) break;

      this.closedList.add(this.coordsToKey(currentNode.x, currentNode.y));

      if (currentNode.x === this.stop[0] && currentNode.y === this.stop[1]) {
        return this.reconstructPath(currentNode);
      }

      const neighbors = this.getNeighbors(currentNode);
      
      for (const neighbor of neighbors) {
        const neighborKey = this.coordsToKey(neighbor.x, neighbor.y);
        
        if (this.closedList.has(neighborKey)) {
          continue;
        }

        const tentativeG = currentNode.g + 1;   
        const existingNode = this.isInOpenList(neighbor.x, neighbor.y);
        
        if (existingNode) {
          if (tentativeG < existingNode.g) {
            existingNode.g = tentativeG;
            existingNode.f = existingNode.g + existingNode.h;
            existingNode.parent = currentNode;
          }
        } else {
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor.x, neighbor.y, this.stop[0], this.stop[1]);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;
          this.openList.push(neighbor);
        }
      }
    }

    console.warn('No path found from', this.start, 'to', this.stop);
    return null;
  }

  getNextMove(enemyPos: [number, number], playerPos: [number, number]): [number, number] | null {
    this.setStartAndGoal(enemyPos, playerPos);
    const path = this.findPath();
    
    if (path && path.length > 1) {
      return path[1];
    }
    
    return null;
  }

  getFullPath(enemyPos: [number, number], playerPos: [number, number]): [number, number][] | null {
    this.setStartAndGoal(enemyPos, playerPos);
    return this.findPath();
  }
}
