import { GamepadSnapshot, GamepadStatus } from "./device";

export interface Motion {
  zoom: number;
  rotate: number;
  pan: number;
}

export function getMotion(interval: number, snapshot: GamepadSnapshot): Motion {
  const { status, axes } = snapshot;
  const [_translateX, translateZ, _translateY] = axes;

  if (status === GamepadStatus.Active) {
    console.log({ axes, interval });
    console.log("Z velocity", -1 * translateZ * interval);

    return {
      zoom: -1 * translateZ * interval,
      rotate: 0,
      pan: 0,
    };
  }

  return {
    zoom: 0,
    rotate: 0,
    pan: 0,
  };
}
