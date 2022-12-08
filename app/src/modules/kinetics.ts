import { GamepadSnapshot, GamepadStatus } from "./device";

export interface Motion {
  zoom: number;
  rotate: number;
  panX: number;
  panY: number;
}

export function getMotion(interval: number, snapshot: GamepadSnapshot): Motion {
  const { status, axes } = snapshot;
  const [devX, devY, devZ] = axes;

  if (status === GamepadStatus.Active) {
    console.log({ axes, interval });

    return {
      zoom: devY * interval * 5,
      rotate: 0,
      panX: devX * interval * 5,
      panY: devZ * interval * 5,
    };
  }

  return {
    zoom: 0,
    rotate: 0,
    panX: 0,
    panY: 0,
  };
}
