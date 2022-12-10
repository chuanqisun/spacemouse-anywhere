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
  let buffer = getInitialBuffer();
  let averageInterval = 0;
  let bufferUpdater = getUpdatedBuffer.bind(null, buffer);

  const multiplier = [2, 2, 2, 1, 1, 1] as const;

  const frameScanner = getScanner<GamepadSnapshot>(
    (oldSnapshot, newSnapshot) => (buffer = bufferUpdater(getInterpolatedFrame(oldSnapshot, newSnapshot, multiplier)))
  );

  const handleFrameRequest = (e: MessageEvent) => {
    if (e.data !== "requestframe") return;

    averageInterval = averageInterval * 0.8 + buffer.interval * 0.2;
    window.parent.postMessage(
      {
        type: "frame",
        axes: buffer.axes,
        status: buffer.status,
      },
      "*"
    );

    buffer = getConsumedBuffer(buffer);
  };

  window.addEventListener("message", handleFrameRequest);
  tick(() => frameScanner(getGamepadSnapshot()));

  setInterval(() => console.log(`[perf] ${(1000 / averageInterval).toFixed(0)} FPS`), 1000);
}

main();
