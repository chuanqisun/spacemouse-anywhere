import { EMPTY_AXES, GamepadAxes, GamepadSnapshot, GamepadStatus } from "./device";

/**
 * Get a function that when recalled repeatedly, the given change handler is invoked
 * with the old and new values for each change.
 *
 * The scanner won't invoke the change handler until the first two values are available,
 * and the first of which must be truthy.
 */
export function getScanner<T>(onChange: (oldValue: T, newValue: T) => any) {
  let oldValue: T | undefined = undefined;

  return (newValue: T) => {
    if (oldValue) {
      onChange(oldValue, newValue);
    }
    oldValue = newValue;
  };
}

export interface FrameBuffer {
  axes: GamepadAxes;
  interval: number;
  status: GamepadStatus;
  isRead: boolean;
}

export interface FrameBufferChange {
  axes: GamepadAxes;
  interval: number;
  status: GamepadStatus;
}

export function getFrameBufferChange(oldSnapshot: GamepadSnapshot, newSnapshot: GamepadSnapshot): FrameBufferChange {
  return {
    axes: newSnapshot.axes.map((axis, i) => axis - oldSnapshot.axes[i]) as any as GamepadAxes,
    interval: newSnapshot.timestamp - oldSnapshot.timestamp,
    status: newSnapshot.status,
  };
}

export function getUpdatedBuffer(buffer: FrameBuffer, change: FrameBufferChange): FrameBuffer {
  return {
    axes: change.axes.map((axis, i) => axis + buffer.axes[i]) as any as GamepadAxes,
    interval: change.interval + buffer.interval,
    // Unless buffer was just read, the active status will be sticky
    status: buffer.isRead || buffer.status !== GamepadStatus.Active ? change.status : buffer.status,
    isRead: buffer.isRead,
  };
}

export function getCleanBuffer(buffer: FrameBuffer): FrameBuffer {
  return {
    axes: EMPTY_AXES,
    interval: 0,
    status: buffer.status,
    isRead: true,
  };
}

// TODO: clean up legacy logic

export interface Motion {
  zoom: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  panX: number;
  panY: number;
}

export function getMotion(interval: number, snapshot: GamepadSnapshot): Motion {
  const { status, axes } = snapshot;
  const [mouseX, mouseY, mouseZ, mouseRotateX, mouseRotateY, mouseRotateZ] = axes;

  if (status === GamepadStatus.Active) {
    return {
      zoom: mouseY * interval * 5,
      rotateX: mouseRotateX * interval * 5,
      rotateY: mouseRotateY * interval * 5,
      rotateZ: mouseRotateZ * interval * 5,
      panX: mouseX * interval * 5,
      panY: mouseZ * interval * 5,
    };
  }

  return {
    zoom: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    panX: 0,
    panY: 0,
  };
}
