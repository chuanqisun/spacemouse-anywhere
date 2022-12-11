import { GamepadAxes, GamepadSnapshot, GamepadStatus, getGamepadSnapshot } from "./modules/device";
import {
  getConsumedBuffer,
  getInitialBuffer,
  getInterpolatedFrame,
  getScanner,
  getUpdatedBuffer,
} from "./modules/kinetics";
import { getRollingAvger } from "./utils/get-rolling-avg";

export interface GamepadSnapshotBuffer {
  axes: GamepadAxes;
  status: GamepadStatus;
}

export default async function main() {
  let buffer = getInitialBuffer();
  let avgV2 = 0;
  let avgIntervalV2 = getRollingAvger(0.1);
  let bufferUpdater = getUpdatedBuffer.bind(null, buffer);

  const multiplier = [20, 20, 20, 10, 10, 10] as const;

  const frameScanner = getScanner<GamepadSnapshot>(
    (oldSnapshot, newSnapshot) => (buffer = bufferUpdater(getInterpolatedFrame(oldSnapshot, newSnapshot, multiplier)))
  );

  const handleFrameRequest = (e: MessageEvent) => {
    if (e.data !== "requestframe") return;

    // In the rare case output thread can request value faster than the input
    // Such request can be safely ignored
    if (!buffer.interval) return;

    avgV2 = avgIntervalV2(avgV2, buffer.interval);

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

  setInterval(() => frameScanner(getGamepadSnapshot()), 2);

  setInterval(() => console.log(`[perf] scan ${(1000 / avgV2).toFixed(0)} Hz`), 100);
}

main();
