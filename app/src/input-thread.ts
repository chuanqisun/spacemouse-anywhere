import { GamepadAxes, GamepadSnapshot, GamepadStatus, getGamepadSnapshot } from "./modules/device";
import {
  getConsumedBuffer,
  getInitialBuffer,
  getInterpolatedFrame,
  getScanner,
  getUpdatedBuffer,
} from "./modules/kinetics";
import { tick } from "./utils/tick";

export interface GamepadSnapshotBuffer {
  axes: GamepadAxes;
  status: GamepadStatus;
}

export default async function main() {
  const state = {
    averageInterval: 0,
    buffer: getInitialBuffer(),
  };

  const multiplier = [2, 2, 2, 1, 1, 1] as const;

  const frameScanner = getScanner((oldSnapshot: GamepadSnapshot, newSnapshot: GamepadSnapshot) => {
    const change = getInterpolatedFrame(oldSnapshot, newSnapshot, multiplier);
    state.buffer = getUpdatedBuffer(state.buffer, change);
  });

  // handle buffer read
  window.addEventListener("message", (e) => {
    if (e.data !== "requestframe") return;

    state.averageInterval = state.averageInterval * 0.8 + state.buffer.interval * 0.2;
    window.parent.postMessage(
      {
        type: "frame",
        axes: state.buffer.axes,
        status: state.buffer.status,
      },
      "*"
    );
    state.buffer = getConsumedBuffer(state.buffer);
  });

  tick(() => frameScanner(getGamepadSnapshot()));

  setInterval(() => console.log(`[perf] ${(1000 / state.averageInterval).toFixed(0)} FPS`), 1000);
}

main();
