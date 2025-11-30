import { fromCoordinatesToKey, manhattan } from "./utils";
import type { NodeInQueue, Position } from "./types";

const openSet: NodeInQueue[] = [];
const gScore = new Map<string, number>();
const fScore = new Map<string, number>();
const cameFrom = new Map<string, string>();

const start: Position = { x: 0, y: 0 };
const goal: Position = { x: 4, y: 4 };
const startKey = fromCoordinatesToKey(start);

// Init
openSet.push({ key: startKey, priority: 0 });
gScore.set(startKey, 0);
fScore.set(startKey, manhattan(start, goal));
