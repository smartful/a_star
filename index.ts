import {
  fromCoordinatesToKey,
  fromKeyToCoordinnates,
  getNeighbors,
  manhattan,
  popLowestPriority,
} from "./utils";
import type { NodeInQueue, Position } from "./types";

const openSet: NodeInQueue[] = [];
const gScore = new Map<string, number>();
const fScore = new Map<string, number>();
const cameFrom = new Map<string, string>();

const start: Position = { x: 0, y: 0 };
const goal: Position = { x: 4, y: 4 };
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
    console.log("Goal reached!");
    break;
  }

  const currentPos = fromKeyToCoordinnates(current?.key);
  const neighbors = getNeighbors(currentPos);

  console.log("Current:", currentPos);
  console.log("Neighbors:", neighbors);
}
