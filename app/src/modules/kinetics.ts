import { GamepadSnapshot, GamepadStatus } from "./device";

export interface Motion {
  zoom: any;
  rotate: any;
  pan: any;
}

export function getMotion(interval: number, snapshot: GamepadSnapshot) {
  const { status, axes } = snapshot;
  if (status === GamepadStatus.Active) {
    console.log(axes);
    console.log("interval", interval);
  }
}
