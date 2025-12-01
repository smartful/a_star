import type { NodeInQueue, Position } from "./types";
import { GRID_WIDTH, GRID_HEIGHT } from "./constants";

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

export const inBounds = (position: Position): boolean => {
  const { x, y } = position;
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
};

export const getNeighbors = (position: Position): Position[] => {
  const { x, y } = position;
  const neighbors = [
    { x: x, y: y - 1 }, // haut
    { x: x + 1, y: y }, // droite
    { x: x, y: y + 1 }, // bas
    { x: x - 1, y: y }, //gauche
  ];

  return neighbors.filter((neighbor) => inBounds(neighbor));
};

export const manhattan = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const popLowestPriority = (queue: NodeInQueue[]) => {
  const sortedQueue = queue.sort((a, b) => a.priority - b.priority);
  return sortedQueue.shift();
};
