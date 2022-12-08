import { GamepadSnapshot, GamepadStatus } from "./device";

export interface Motion {
  zoom: number;
  orbitX: number;
  orbitZ: number;
  panX: number;
  panY: number;
}

export function getMotion(interval: number, snapshot: GamepadSnapshot): Motion {
  const { status, axes } = snapshot;
  const [mouseX, mouseY, mouseZ, mouseRotateX, _, mouseRotateZ] = axes;

  if (status === GamepadStatus.Active) {
    return {
      zoom: mouseY * interval * 5,
      orbitX: mouseRotateX * interval * 5,
      orbitZ: mouseRotateZ * interval * 5,
      panX: mouseX * interval * 5,
      panY: mouseZ * interval * 5,
    };
  }

  return {
    zoom: 0,
    orbitX: 0,
    orbitZ: 0,
    panX: 0,
    panY: 0,
  };
}

export const isStill = (motion: Motion) =>
  motion.panX === 0 && motion.panY === 0 && motion.zoom === 0 && motion.orbitX === 0 && motion.orbitZ === 0;
