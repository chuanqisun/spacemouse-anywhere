import { GamepadAxes, GamepadSnapshot, GamepadStatus, getGamepadSnapshot } from "./modules/device";
import {
  FrameBufferChange,
  getConsumedBuffer,
  getInitialBuffer,
  getInterpolatedFrame,
  getScanner,
  getUpdatedBuffer,
} from "./modules/kinetics";

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

  let lastTick = performance.now();

  let avgLatency = 0;
  let avgBufferInterval = 0;

  const handleFrameRequest = (e: MessageEvent) => {
    if (e.data.type !== "requestframe") return;

    avgBufferInterval = avgBufferInterval * 0.93 + (e.data.timestamp - lastTick) * 0.07;
    lastTick = e.data.timestamp;

    avgLatency = avgLatency * 0.93 + e.data.latency * 0.07;

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

  let lastScan = performance.now();
  let avgScanInterval = 0;

  const recurviseScan = () => {
    scanFrame(getGamepadSnapshot());
    avgScanInterval = avgScanInterval * 0.99 + (performance.now() - lastScan) * 0.01;
    lastScan = performance.now();
    setTimeout(recurviseScan);
  };

  recurviseScan();

  chrome.runtime.onMessage.addListener((e, sender, sendReponse) => {
    if (e === "requestperf") {
      sendReponse({
        avgBufferInterval,
        avgLatency,
        avgScanInterval,
      });
      console.log("responded");
    }
  });
}

main();
