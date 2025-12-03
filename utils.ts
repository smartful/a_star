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

export const inBounds = (grid: number[][], position: Position): boolean => {
  const { x, y } = position;
  const gridHeigh = grid.length;
  const gridWidth = grid[0]?.length ?? 0;
  return x >= 0 && x < gridWidth && y >= 0 && y < gridHeigh;
};

export const getNeighbors = (
  grid: number[][],
  position: Position
): Position[] => {
  const { x, y } = position;
  const neighbors = [
    { x: x, y: y - 1 }, // haut
    { x: x + 1, y: y }, // droite
    { x: x, y: y + 1 }, // bas
    { x: x - 1, y: y }, //gauche
  ];

  const inGridNeighbors = neighbors.filter((neighbor) =>
    inBounds(grid, neighbor)
  );
  // Filtre les obstacles
  const filteredNeighbors = inGridNeighbors.filter((neighbor) => {
    const row = grid[neighbor.y];
    if (!row) return false;
    return row[neighbor.x] !== 1;
  });

  return filteredNeighbors;
};

export const manhattan = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const popLowestPriority = (queue: NodeInQueue[]) => {
  const sortedQueue = queue.sort((a, b) => a.priority - b.priority);
  return sortedQueue.shift();
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
    case 2:
      // type de terrain avec un coût à 5
      return 5;
    case 3:
      // type de terrain avec un coût à 20
      return 20;
    default:
      return 1;
  }
};
