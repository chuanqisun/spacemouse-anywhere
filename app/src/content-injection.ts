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
import { getApi, pan, zoom } from "./modules/sketch-up";
import { tick } from "./utils/tick";
import { withInterval } from "./utils/with-interval";

export default async function main() {
  console.log("content injection live");

  const api = await getApi();
  console.log("api available");

  const gamepadFrameHandler = (interval: number) => {
    const motion = getMotion(interval, getGamepadSnapshot(selectSpaceMouse));
    if (motion.zoom) {
      zoom(api, motion.zoom);
    }

    if (motion.panX || motion.panY) {
      pan(api, motion.panX, motion.panY);
    }
  };
  const gamepadIntervalFrameHandler = withInterval(gamepadFrameHandler);

  tick(gamepadIntervalFrameHandler);
}

// No need to call default exported function. Chrome runtime will execute.
