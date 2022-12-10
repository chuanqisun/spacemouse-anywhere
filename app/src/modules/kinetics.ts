import { GamepadSnapshot, GamepadStatus } from "./device";

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
