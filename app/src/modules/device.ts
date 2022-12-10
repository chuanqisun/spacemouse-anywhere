export interface GamepadSnapshot {
  status: GamepadStatus;
  axes: GamepadAxes;
  timestamp: number;
}

export enum GamepadStatus {
  Disconnected = 0,
  Idle = 1,
  Active = 2,
}

export type GamepadAxes = readonly [
  mouseX: number, // Left=-1, Right=1
  mouseY: number, //Forward, Backward
  mouseZ: number, // Up, Down
  mouseRotateX: number, // Pitch up, Pitch down
  mouseRotateY: number, // Roll right, Roll light
  mouseRotateZ: number // Yaw left, Yaw right
];

const EMPTY_AXES = Object.freeze([0, 0, 0, 0, 0, 0]) as GamepadAxes;

/**
 * Get the current state of the device using the navigator gamepad API
 * Return null if device not found.
 */
export const getGamepadSnapshot = (selectGamepad: (gamepad: Gamepad | null) => boolean) => {
  const gamepad = navigator.getGamepads().filter(selectGamepad).reduce(selectFirstItem, null);
  if (!gamepad)
    return {
      status: GamepadStatus.Disconnected,
      axes: EMPTY_AXES,
      timestamp: performance.now(),
    };

  return {
    status: gamepad.axes.some(Boolean) ? GamepadStatus.Active : GamepadStatus.Idle,
    axes: gamepad.axes as GamepadAxes,
    timestamp: performance.now(),
  };
};

export function selectFirstItem<T extends any>(_prev: any, _current: any, _index: number, array: T[]): T {
  return array[0];
}

export function selectSpaceMouse(gamepad: Gamepad | null) {
  if (!gamepad?.id) return false;
  if (gamepad?.axes?.length !== 6) return false;

  const gamepadName = gamepad.id.toLowerCase();

  // Credit: id filter is borrowed from https://github.com/arpruss/spacemouse-tinkercad/blob/master/spacenav.js
  const isIdRecognized =
    (gamepadName.indexOf("vendor: 046d") > -1 && gamepadName.indexOf("product: c6") > -1) ||
    (gamepadName.indexOf("vendor: 256f") > -1 && gamepadName.indexOf("product: c6") > -1) ||
    gamepadName.indexOf("spacenavigator") > -1 ||
    gamepadName.indexOf("space navigator") > -1 ||
    gamepadName.indexOf("spacemouse") > -1 ||
    gamepadName.indexOf("space mouse") > -1;

  return isIdRecognized;
}
