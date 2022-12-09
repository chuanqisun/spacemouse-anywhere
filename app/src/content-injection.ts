/**
 * In order to bundle the content script and keep it compatible with `chrome.scripting` api, make sure each file uses the following format:
 * ```typescript
 * export default function nameOfFunciont() {
 *   // implementation
 * }
 * ```
 * See related setup in `build.js`
 */

import { GamepadSnapshot, GamepadStatus, getGamepadSnapshot, selectSpaceMouse } from "./modules/device";
import { controlScroll, drag, getApi, shiftDrag } from "./modules/sketch-up";
import { tick } from "./utils/tick";

export default async function main() {
  console.log("content injection live");
  const api = await getApi();
  console.log("api detected");

  const getFrameScanner = <T>(onFrameChange: (oldFrame: T, newFrame: T) => any) => {
    let oldFrame: T | undefined = undefined;
    return (frame: T) => {
      if (oldFrame) {
        onFrameChange(oldFrame, frame);
      }
      oldFrame = frame;
    };
  };

  let restoreCommandId: number | null = null;

  const multiplier = [2, 2, 2, 1, 1, 1];

  const frameScanner = getFrameScanner((oldFrame: GamepadSnapshot, newFrame: GamepadSnapshot) => {
    if (oldFrame.status !== GamepadStatus.Active && newFrame.status === GamepadStatus.Active) {
      const activeCommand = api.GetActiveToolId();
      if ((restoreCommandId = activeCommand !== api.OrbitCommandId ? activeCommand : null)) {
        api.RunCommand(api.OrbitCommandId);
      }
    } else if (newFrame.status !== GamepadStatus.Active && oldFrame.status === GamepadStatus.Active) {
      if (restoreCommandId) {
        api.RunCommand(restoreCommandId); // restore
      }
    } else if (oldFrame.status !== GamepadStatus.Active && newFrame.status !== GamepadStatus.Active) {
      return;
    } else {
      const interval = newFrame.timestamp - oldFrame.timestamp;
      console.log(interval);
      const [panX, zoom, panY, rotateX, _rotateY, rotateZ] = newFrame.axes.map(
        (newValue, i) => (newValue + oldFrame.axes[i]) * interval * multiplier[i]
      );

      zoom && controlScroll(api, zoom);
      (panX || panY) && shiftDrag(api, panX, panY);
      (rotateX || rotateZ) && drag(api, rotateX, rotateZ);
    }
  });

  tick(() => frameScanner(getGamepadSnapshot(selectSpaceMouse)));
}

// No need to call default exported function. Chrome runtime will execute.
