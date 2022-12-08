export type Poller = (...args: any[]) => GamepadSnapshot;

export interface GamepadSnapshot {
  status: GamepadStatus;
  axes: GamepadAxes;
}

export enum GamepadStatus {
  Disconnected = 0,
  Idle = 1,
  Active = 2,
}

export type GamepadAxes = [
  translateX: number, // Left=-1, Right=1
  translateZ: number, //Forward, Backward
  translateY: number, // Up, Down
  rotateX: number, // Pitch up, Pitch down
  rotateZ: number, // Roll right, Roll light
  rotateY: number // Yaw left, Yaw right
];

export const getGamepadSnapshot: Poller = (selectGamepad: (gamepad: Gamepad | null) => boolean) => {
  const spaceNavigator = navigator.getGamepads().find(selectGamepad);
  let { status, axes } = { status: GamepadStatus.Disconnected, axes: [0, 0, 0, 0, 0, 0] as GamepadAxes };

  if (spaceNavigator?.axes) {
    axes = spaceNavigator.axes as GamepadAxes;
    if (axes.every((item) => item === 0)) {
      status = GamepadStatus.Idle;
    } else {
      status = GamepadStatus.Active;
    }
  } else {
    axes = [0, 0, 0, 0, 0, 0];
    status = GamepadStatus.Disconnected;
  }

  return { status, axes };
};

export function selectSpaceMouse(gamepad: Gamepad | null) {
  if (!gamepad?.id) return false;
  if (gamepad?.axes?.length !== 6) return false;

  const gamepadName = gamepad.id.toLowerCase();

  // id filter is borrowed from https://github.com/arpruss/spacemouse-tinkercad/blob/master/spacenav.js
  const isIdRecognized =
    (gamepadName.indexOf("vendor: 046d") > -1 && gamepadName.indexOf("product: c6") > -1) ||
    (gamepadName.indexOf("vendor: 256f") > -1 && gamepadName.indexOf("product: c6") > -1) ||
    gamepadName.indexOf("spacenavigator") > -1 ||
    gamepadName.indexOf("space navigator") > -1 ||
    gamepadName.indexOf("spacemouse") > -1 ||
    gamepadName.indexOf("space mouse") > -1;

  return isIdRecognized;
}
