/**
 * In order to bundle the content script and keep it compatible with `chrome.scripting` api, make sure each file uses the following format:
 * ```typescript
 * export default function nameOfFunciont() {
 *   // implementation
 * }
 * ```
 * See related setup in `build.js`
 */

import { getGamepadSnapshot, selectSpaceMouse } from "./modules/device";
import { getMotion } from "./modules/kinetics";
import { tick } from "./utils/tick";
import { withInterval } from "./utils/with-interval";

export default function main() {
  console.log("content script live");

  const gamepadFrameHandler = (interval: number) => {
    const motion = getMotion(interval, getGamepadSnapshot(selectSpaceMouse));
  };
  const gamepadIntervalFrameHandler = withInterval(gamepadFrameHandler);

  tick(gamepadIntervalFrameHandler);
}

// No need to call default exported function. Chrome runtime will execute.
