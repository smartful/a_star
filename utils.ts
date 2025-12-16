import type { NodeInQueue, Position } from "./types";

export const fromCoordinatesToKey = (coordinates: Position): string => {
  return `${coordinates.x},${coordinates.y}`;
};

export const fromKeyToCoordinnates = (key: string): Position => {
  const coordinatesTab = key.split(",").map(Number) as [number, number];

  if (coordinatesTab.length !== 2 || coordinatesTab.some(isNaN)) {
    throw new Error(`Invalid key format: "${key}". Expected format: "x,y"`);
  }

  const [x, y] = coordinatesTab;

  return { x, y };
};

export const makeUnknownGridLike = (grid: number[][]): number[][] => {
  return grid.map((row) => row.map(() => -1));
};

export const inBounds = (grid: number[][], position: Position): boolean => {
  const { x, y } = position;
  const gridHeigh = grid.length;
  const gridWidth = grid[0]?.length ?? 0;
  return x >= 0 && x < gridWidth && y >= 0 && y < gridHeigh;
};

export const isDiagonalMove = (position: Position, neighbor: Position) => {
  return neighbor.x !== position.x && neighbor.y !== position.y;
};

export const isWalkable = (grid: number[][], position: Position): boolean => {
  const row = grid[position.y];
  if (!row) return false;
  return row[position.x] !== 1;
};

export const getNeighbors = (
  grid: number[][],
  position: Position
): Position[] => {
  const { x, y } = position;
  const neighbors = [
    { x: x, y: y - 1 }, // haut
    { x: x + 1, y: y - 1 }, // haut à droite
    { x: x + 1, y: y }, // droite
    { x: x + 1, y: y + 1 }, // bas à droite
    { x: x, y: y + 1 }, // bas
    { x: x - 1, y: y + 1 }, // bas à gauche
    { x: x - 1, y: y }, // gauche
    { x: x - 1, y: y - 1 }, // haut à gauche
  ].filter(
    (neighbor) => inBounds(grid, neighbor) && isWalkable(grid, neighbor)
  );

  return neighbors.filter((neighbor) => {
    const dx = neighbor.x - x;
    const dy = neighbor.y - y;

    if (dx === 0 || dy === 0) {
      // Le mouvement n'est pas en diagonale
      return true;
    }

    // Check des côtés
    const sideA = { x: x + dx, y };
    const sideB = { x, y: y + dy };
    return isWalkable(grid, sideA) && isWalkable(grid, sideB);
  });
};

/* Heuristiques */

// Pour mouvement purement orthogonaux
export const manhattan = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Pour mouvement qui autorise les diagonales
export const octileDistance = (a: Position, b: Position): number => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const minD = Math.min(dx, dy);
  const maxD = Math.max(dx, dy);
  return minD * Math.sqrt(2) + (maxD - minD);
};

export const popLowestPriority = (queue: NodeInQueue[]) => {
  if (queue.length === 0) return undefined;

  let bestIndex = 0;

  for (let i = 0; i < queue.length; i++) {
    if (queue[i]!.priority < queue[bestIndex]!.priority) {
      bestIndex = i;
    }
  }

  const [best] = queue.splice(bestIndex, 1);

  return best;
};

export const reconstructPath = (
  cameFrom: Map<string, string>,
  currentKey: string
): string[] => {
  const pathKey = [currentKey];

  while (cameFrom.has(currentKey)) {
    currentKey = cameFrom.get(currentKey)!;
    pathKey.push(currentKey);
  }

  return pathKey.reverse();
};

export const getAppropriateCost = (
  grid: number[][],
  position: Position
): number => {
  const row = grid[position.y];
  if (!row) return 1;
  const cell = row[position.x];

  switch (cell) {
    case 0:
      return 1;
    case -1:
      // type de terrain inconnue
      return 1;
    case 2:
      // type de terrain avec un coût à 5
      return 5;
    case 3:
      // type de terrain avec un coût à 20
      return 20;
    default:
      return Infinity;
  }
};

export const printGridWithPath = (
  grid: number[][],
  pathKeys: string[],
  start: Position,
  goal: Position
): void => {
  const startKey = fromCoordinatesToKey(start);
  const goalKey = fromCoordinatesToKey(goal);
  const pathSet = new Set<string>(pathKeys);
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];

    if (!row) {
      console.log("");
      continue;
    }

    let rowStr = "";

    for (let x = 0; x < row?.length; x++) {
      const key = `${x},${y}`;

      let char: string;
      if (key === startKey) {
        char = "S";
      } else if (key === goalKey) {
        char = "G";
      } else if (pathSet.has(key)) {
        char = "*";
      } else {
        const cell = row[x];
        if (cell === 0) {
          char = ".";
        } else if (cell === 1) {
          char = "#";
        } else if (cell === 2) {
          char = "~";
        } else if (cell === 3) {
          char = "^";
        } else {
          char = "?";
        }
      }

      rowStr += char;
    }
    console.log(rowStr);
  }
};

export const computePathCost = (
  grid: number[][],
  pathKey: string[]
): number => {
  let total = 0;
  for (const key of pathKey) {
    const position = fromKeyToCoordinnates(key);
    total += getAppropriateCost(grid, position);
  }

  return total;
};

export const aStar = (
  grid: number[][],
  start: Position,
  goal: Position
): string[] => {
  const startKey = fromCoordinatesToKey(start);
  const goalKey = fromCoordinatesToKey(goal);

  const openSet: NodeInQueue[] = [];
  const closedSet = new Set<string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();

  // Init
  openSet.push({ key: startKey, priority: 0 });
  gScore.set(startKey, 0);
  fScore.set(startKey, octileDistance(start, goal));

  while (openSet.length > 0) {
    const current = popLowestPriority(openSet);
    if (!current) return [];
    if (closedSet.has(current.key)) continue;
    closedSet.add(current.key);

    if (current?.key === goalKey) {
      return reconstructPath(cameFrom, current.key);
    }

    const currentPos = fromKeyToCoordinnates(current?.key);
    const neighbors = getNeighbors(grid, currentPos);

    for (const neighbor of neighbors) {
      const neighborKey = fromCoordinatesToKey(neighbor);
      if (closedSet.has(neighborKey)) continue;

      const currentGScore = gScore.get(current.key)!;
      const baseCost = getAppropriateCost(grid, neighbor);
      const isDiagonal = isDiagonalMove(currentPos, neighbor);
      const directionMutiplier = isDiagonal ? Math.sqrt(2) : 1;
      const tryGScore = currentGScore + baseCost * directionMutiplier;
      const neighborGScore = gScore.get(neighborKey) ?? Infinity;

      if (tryGScore < neighborGScore) {
        cameFrom.set(neighborKey, current.key);
        gScore.set(neighborKey, tryGScore);
        fScore.set(neighborKey, tryGScore + octileDistance(neighbor, goal));

        const isAlreadyInOpenSet = openSet.some(
          (node) => node.key === neighborKey
        );

        if (!isAlreadyInOpenSet) {
          openSet.push({
            key: neighborKey,
            priority: fScore.get(neighborKey)!,
          });
        }
      }
    }
  }

  return [];
};

export const observeAround = (
  realGrid: number[][],
  perceivedGrid: number[][],
  position: Position
): Set<string> => {
  const changedKeys = new Set<string>();
  for (let dy of [-1, 0, 1]) {
    for (let dx of [-1, 0, 1]) {
      const x = position.x + dx;
      const y = position.y + dy;
      const newPosition = { x, y };
      if (!inBounds(realGrid, newPosition)) continue;

      const realRow = realGrid[y];
      const perceivedRow = perceivedGrid[y];
      if (!realRow || !perceivedRow) continue;

      const value = realRow[x];
      if (value === undefined) continue;

      if (perceivedRow[x] !== value) {
        perceivedRow[x] = value;
        changedKeys.add(`${x},${y}`);
      }
    }
  }

  return changedKeys;
};

export const isBlockedNextStep = (
  perceivedGrid: number[][],
  pathKeys: string[]
): boolean => {
  if (pathKeys.length < 2) {
    return true;
  }

  const nextKey = pathKeys[1];
  if (nextKey === undefined) {
    throw new Error(
      `Invalid key format: "${nextKey}". Key should not be undefined"`
    );
  }
  const { x, y } = fromKeyToCoordinnates(nextKey);
  return perceivedGrid[y]?.[x] === 1;
};
