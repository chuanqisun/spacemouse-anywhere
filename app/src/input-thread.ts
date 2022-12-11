import { GamepadAxes, GamepadSnapshot, GamepadStatus, getGamepadSnapshot } from "./modules/device";
import {
  FrameBufferChange,
  getConsumedBuffer,
  getInitialBuffer,
  getInterpolatedFrame,
  getScanner,
  getUpdatedBuffer,
} from "./modules/kinetics";
import { getRollingAverager } from "./utils/get-rolling-avg";

export interface GamepadSnapshotBuffer {
  axes: GamepadAxes;
  status: GamepadStatus;
}

export interface PerfMetrics {
  avgBufferInterval: number;
  avgLatency: number;
  avgScanInterval: number;
}

export default async function main() {
  let buffer = getInitialBuffer();

  let bufferUpdater = (change: FrameBufferChange) => getUpdatedBuffer(buffer, change);

  const multiplier = [4, 4, 4, 2, 2, 2] as const;

  const scanFrame = getScanner<GamepadSnapshot>(
    (oldSnapshot, newSnapshot) => (buffer = bufferUpdater(getInterpolatedFrame(oldSnapshot, newSnapshot)))
  );

  let lastBufferRequest = performance.now();
  let lastScan = performance.now();

  let avgLatency = getRollingAverager(0.05);
  let avgBufferInterval = getRollingAverager(0.05);
  let avgScanInterval = getRollingAverager(0.01);

  const handleFrameRequest = (e: MessageEvent) => {
    if (e.data.type !== "requestframe") return;

    avgBufferInterval.next(e.data.timestamp - lastBufferRequest);
    lastBufferRequest = e.data.timestamp;

    avgLatency.next(e.data.latency);

    // In the rare case output thread can request value faster than the input
    // Such request can be safely ignored
    if (!buffer.interval) return;

    window.parent.postMessage(
      {
        type: "frame",
        axes: buffer.axes.map((axis, i) => axis * multiplier[i]),
        status: buffer.status,
      },
      "*"
    );

    buffer = getConsumedBuffer(buffer);
  };

  window.addEventListener("message", handleFrameRequest);

  const recurviseScan = () => {
    scanFrame(getGamepadSnapshot());
    avgScanInterval.next(performance.now() - lastScan);
    lastScan = performance.now();
    setTimeout(recurviseScan);
  };

  recurviseScan();

  chrome.runtime.onMessage.addListener((e, sender, sendReponse) => {
    if (e === "requestperf") {
      sendReponse({
        avgBufferInterval: avgBufferInterval.value(),
        avgLatency: avgLatency.value(),
        avgScanInterval: avgScanInterval.value(),
      });
    }
  });
}

main();
