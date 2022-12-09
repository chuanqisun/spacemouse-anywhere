import { Motion } from "./kinetics";

declare global {
  interface Window {
    Module: SketchUpWebApi;
  }
}

export interface SketchUpWebApi {
  mouseButtonHandler(button: MouseButton, action: MouseButtonAction, x: number, y: number): any;
  onKeyDown(e: VirtualKeyEvent): any;
  onKeyUp(e: VirtualKeyEvent): any;
  scrollHandler(x: number, y: number, deltaX: number, deltaY: number, ctrlKey: boolean): any;
  mouseMoveHandler(x: number, y: number): any;
  getViewportDimensions(): { width: number; height: number };
  GetActiveToolId(): number;
  RunCommand(id: number): any;
  OrbitCommandId: number; // 10508
  ZoomCommandId: number; // 10509
  PanCommandId: number; //10523
  LookAroundCommandId: number; // 10525
}

enum MouseButton {
  LEFT = 0,
}

enum MouseButtonAction {
  DOWN = 0,
  UP = 1,
}

interface VirtualKeyEvent {
  physicalKey: string;
  inputChar: number;
  keyCode: number;
}

export async function getApi() {
  return new Promise<SketchUpWebApi>((resolve) => {
    const intervalHandle = setInterval(() => {
      if (typeof window.Module?.GetActiveToolId === "function") {
        clearInterval(intervalHandle);
        resolve(window.Module);
      }
    }, 1000);
  });
}

export function controlScroll(api: SketchUpWebApi, factor: number) {
  // api.onKeyDown({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
  api.scrollHandler(1, 1, 0, factor, true);
  // api.onKeyUp({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
}

export function shiftDrag(api: SketchUpWebApi, panX: number, panY: number) {
  api.onKeyDown({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });
  api.mouseButtonHandler(0, 0, 0, 0);
  api.mouseMoveHandler(panX, panY);
  api.mouseButtonHandler(0, 1, 0, 0);
  api.onKeyUp({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });
}

export function drag(api: SketchUpWebApi, rotateX: number, rotateZ: number) {
  api.mouseButtonHandler(0, 0, 0, 0);
  api.mouseMoveHandler(-rotateZ, rotateX);
  api.mouseButtonHandler(0, 1, 0, 0);
}

export const runInMode =
  <T extends any[]>(api: SketchUpWebApi, mode: number, task: (...args: T) => any) =>
  (...args: T) => {
    const activeCommand = api.GetActiveToolId();
    const needCommandChange = activeCommand !== mode;
    if (needCommandChange) {
      api.RunCommand(mode);
    }

    task(...args);

    if (needCommandChange) {
      api.RunCommand(activeCommand); // restore
    }
  };

export const sceneZoomPanOrbit = (api: SketchUpWebApi) =>
  runInMode(api, api.OrbitCommandId, (motion: Motion) => {
    if (motion.zoom) {
      controlScroll(api, motion.zoom);
    }

    if (motion.panX || motion.panY) {
      shiftDrag(api, motion.panX, motion.panY);
    }

    if (motion.rotateX || motion.rotateZ) {
      drag(api, motion.rotateX, motion.rotateZ);
    }
  });

export const sceneInverseOrbit = (api: SketchUpWebApi) =>
  runInMode(api, api.OrbitCommandId, (motion: Motion) => {
    if (motion.rotateX || motion.rotateZ) {
      drag(api, -motion.rotateX, -motion.rotateZ);
    }
  });

export const cameraZoomPan = (api: SketchUpWebApi) =>
  runInMode(api, api.OrbitCommandId, (motion: Motion) => {
    if (motion.zoom) {
      controlScroll(api, -motion.zoom);
    }

    if (motion.panX || motion.panY) {
      shiftDrag(api, -motion.panX, -motion.panY);
    }
  });

export const cameraLook = (api: SketchUpWebApi) =>
  runInMode(api, api.LookAroundCommandId, (motion: Motion) => {
    if (motion.rotateX || motion.rotateZ) {
      drag(api, -motion.rotateX, -motion.rotateZ);
    }
  });

export const applyCameraMotion = (api: SketchUpWebApi, motion: Motion) => {
  if (motion.rotateX || motion.rotateZ) {
    drag(api, motion.rotateX, motion.rotateZ);
  }
};
