import {
  aStar,
  fromCoordinatesToKey,
  fromKeyToCoordinnates,
  isBlockedNextStep,
  makeUnknownGridLike,
  observeAround,
  printGridWithPath,
} from "./utils";
import type { Position } from "./types";

const realGrid = [
  [0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 3, 3, 3, 0, 0],
  [0, 2, 1, 1, 0, 0, 0, 3, 0, 2],
  [0, 2, 0, 0, 0, 1, 0, 3, 0, 0],
  [0, 2, 0, 3, 3, 1, 0, 0, 0, 3],
  [0, 0, 0, 3, 0, 0, 0, 2, 2, 0],
  [0, 3, 3, 3, 0, 1, 0, 2, 1, 0],
  [2, 0, 0, 0, 0, 1, 0, 2, 0, 0],
  [0, 2, 2, 0, 1, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
];
let perceivedGrid = makeUnknownGridLike(realGrid);

const start: Position = { x: 0, y: 0 };
const goal: Position = { x: 9, y: 9 };
const startKey = fromCoordinatesToKey(start);
const goalKey = fromCoordinatesToKey(goal);

let robotPosition: Position = start;
let path: string[] = [];
let step = 0;

while (fromCoordinatesToKey(robotPosition) !== goalKey) {
  step++;
  const changedKeys = observeAround(realGrid, perceivedGrid, robotPosition);

  const shouldReplan =
    path.length === 0 ||
    isBlockedNextStep(perceivedGrid, path) ||
    path.slice(2, 6).some((key) => changedKeys.has(key));

  // Replan if necessary
  if (shouldReplan) {
    path = aStar(perceivedGrid, robotPosition, goal);

    if (path.length === 0) {
      console.log("No path found");
      break;
    }

    console.log(
      `\n[Replan #${step}] robotPosition=${fromCoordinatesToKey(robotPosition)}`
    );
    printGridWithPath(perceivedGrid, path, robotPosition, goal);
  }

  // Move forward
  const nextKey = path[1]!;
  robotPosition = fromKeyToCoordinnates(nextKey);

  path = path.slice(1);
}

if (fromCoordinatesToKey(robotPosition) === goalKey) {
  console.log("\n✅ Goal reached at", goalKey);
}
