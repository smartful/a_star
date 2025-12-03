import {
  fromCoordinatesToKey,
  fromKeyToCoordinnates,
  getAppropriateCost,
  getNeighbors,
  manhattan,
  popLowestPriority,
  reconstructPath,
} from "./utils";
import type { NodeInQueue, Position } from "./types";

const grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 3, 3, 3, 0, 0],
  [0, 2, 1, 1, 0, 0, 0, 3, 0, 2],
  [0, 2, 0, 0, 0, 1, 0, 3, 0, 0],
  [0, 2, 0, 3, 3, 1, 0, 0, 0, 3],
  [0, 0, 0, 3, 0, 0, 0, 2, 2, 0],
  [0, 3, 3, 3, 0, 1, 0, 2, 1, 0],
  [2, 0, 0, 0, 0, 1, 0, 2, 0, 0],
  [0, 2, 2, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
];

const openSet: NodeInQueue[] = [];
const gScore = new Map<string, number>();
const fScore = new Map<string, number>();
const cameFrom = new Map<string, string>();

const start: Position = { x: 0, y: 0 };
const goal: Position = { x: 9, y: 9 };
const startKey = fromCoordinatesToKey(start);
const goalKey = fromCoordinatesToKey(goal);

// Init
openSet.push({ key: startKey, priority: 0 });
gScore.set(startKey, 0);
fScore.set(startKey, manhattan(start, goal));

while (openSet.length > 0) {
  const current = popLowestPriority(openSet);
  if (!current) break;

  if (current?.key === goalKey) {
    // Reconstruction du chemin
    const pathKey = reconstructPath(cameFrom, current.key);
    console.log("Path : ", pathKey);
    break;
  }

  const currentPos = fromKeyToCoordinnates(current?.key);
  const neighbors = getNeighbors(grid, currentPos);

  for (const neighbor of neighbors) {
    const neighborKey = fromCoordinatesToKey(neighbor);
    const currentGScore = gScore.get(current.key)!;
    const cost = getAppropriateCost(grid, neighbor);
    const tryGScore = currentGScore + cost;
    const neighborGScore = gScore.get(neighborKey) ?? Infinity;

    if (tryGScore < neighborGScore) {
      cameFrom.set(neighborKey, current.key);
      gScore.set(neighborKey, tryGScore);
      fScore.set(neighborKey, tryGScore + manhattan(neighbor, goal));

      const isAlreadyInOpenSet = openSet.some(
        (node) => node.key === neighborKey
      );

      if (!isAlreadyInOpenSet) {
        openSet.push({ key: neighborKey, priority: fScore.get(neighborKey)! });
      }
    }
  }
}
