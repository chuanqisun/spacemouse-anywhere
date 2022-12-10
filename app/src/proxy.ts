/**
 * In order to bundle the content script and keep it compatible with `chrome.scripting` api, make sure each file uses the following format:
 * ```typescript
 * export default function nameOfFunciont() {
 *   // implementation
 * }
 * ```
 * See related setup in `build.js`
 */

import { GamepadAxes, GamepadSnapshot, GamepadStatus, getGamepadSnapshot, selectSpaceMouse } from "./modules/device";
import { tick } from "./utils/tick";

export interface GamepadSnapshotBuffer {
  axes: GamepadAxes;
  status: GamepadStatus;
}

let bufferAxes = [0, 0, 0, 0, 0, 0];
let bufferInterval = 0;
let bufferStatus = GamepadStatus.Disconnected;

let averageInterval = 0;

export default async function main() {
  console.log("proxy live");

  const getFrameScanner = <T>(onFrameChange: (oldFrame: T, newFrame: T) => any) => {
    let oldFrame: T | undefined = undefined;
    return (frame: T) => {
      if (oldFrame) {
        onFrameChange(oldFrame, frame);
      }
      oldFrame = frame;
    };
  };

  const multiplier = [2, 2, 2, 1, 1, 1];

  const frameScanner = getFrameScanner((oldFrame: GamepadSnapshot, newFrame: GamepadSnapshot) => {
    const interval = newFrame.timestamp - oldFrame.timestamp;
    bufferAxes = newFrame.axes.map(
      (newValue, i) => bufferAxes[i] + (newValue + oldFrame.axes[i]) * interval * multiplier[i]
    );

    bufferInterval += interval;
    bufferStatus = newFrame.status;
  });

  // handle buffer read
  window.addEventListener("message", (e) => {
    if (e.data !== "requestframe") return;

    averageInterval = averageInterval * 0.8 + bufferInterval * 0.2;
    window.parent.postMessage(
      {
        type: "frame",
        axes: bufferAxes,
        status: bufferStatus,
      },
      "*"
    );
    bufferAxes = [0, 0, 0, 0, 0, 0];
    bufferInterval = 0;
  });

  tick(() => frameScanner(getGamepadSnapshot(selectSpaceMouse)));

  setInterval(() => console.log(`[perf] ${(1000 / averageInterval).toFixed(0)} FPS`), 1000);
}

main();

// No need to call default exported function. Chrome runtime will execute.
