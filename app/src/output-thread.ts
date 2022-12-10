/**
 * In order to bundle the content script and keep it compatible with `chrome.scripting` api, make sure each file uses the following format:
 * ```typescript
 * export default function nameOfFunciont() {
 *   // implementation
 * }
 * ```
 * See related setup in `build.js`
 */

import type { GamepadSnapshotBuffer } from "./input-thread";
import { GamepadStatus } from "./modules/device";
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

  const frameScanner = getFrameScanner((oldFrame: GamepadSnapshotBuffer, newFrame: GamepadSnapshotBuffer) => {
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
    }

    const [mouseX, mouseY, mouseZ, mouseRotateX, _mouseRotateY, mouseRoatateZ] = newFrame.axes;
    mouseY && controlScroll(api, mouseY);
    (mouseX || mouseZ) && shiftDrag(api, mouseX, mouseZ);
    (mouseRotateX || mouseRoatateZ) && drag(api, -mouseRoatateZ, mouseRotateX);
  });

  let sendTime = 0;
  let averageLatency = 0;
  const proxy = document.getElementById("spacemouse-extension") as HTMLIFrameElement;
  window.addEventListener("message", (e) => {
    if (e.data.type !== "frame") return;
    frameScanner(e.data as GamepadSnapshotBuffer);
    averageLatency = averageLatency * 0.8 + (performance.now() - sendTime) * 0.2;
  });

  tick(() => {
    sendTime = performance.now();
    proxy.contentWindow?.postMessage("requestframe", "*");
  });

  setInterval(() => console.log(`[perf] Latency ${averageLatency} ms`), 1000);
}

// No need to call default exported function. Chrome runtime will execute.
