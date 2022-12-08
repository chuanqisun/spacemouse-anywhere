import { Motion } from "./kinetics";

export async function getApi() {
  return new Promise<SketchUpWebApi>((resolve) => {
    const intervalHandle = setInterval(() => {
      if (typeof globalThis.Module?.GetActiveToolId === "function") {
        clearInterval(intervalHandle);
        resolve(Module);
      }
    }, 1000);
  });
}

export function zoom(api: SketchUpWebApi, factor: number) {
  api.onKeyDown({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
  api.scrollHandler(1, 1, 0, factor, true);
  api.onKeyUp({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
}

export function pan(api: SketchUpWebApi, panX: number, panY: number) {
  api.onKeyDown({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });
  api.mouseButtonHandler(0, 0, 0, 0);
  api.mouseMoveHandler(panX, panY);
  api.mouseButtonHandler(0, 1, 0, 0);
  api.onKeyUp({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });
}

export const runInOrbitMode =
  <T extends any[]>(api: SketchUpWebApi, task: (...args: T) => any) =>
  (...args: T) => {
    const activeCommand = api.GetActiveToolId();
    const needCommandChange = activeCommand !== api.OrbitCommandId;
    if (needCommandChange) {
      api.RunCommand(api.OrbitCommandId);
    }

    task(...args);

    if (needCommandChange) {
      api.RunCommand(activeCommand); // restore
    }
  };

export const applyOrbitMotion = (api: SketchUpWebApi, motion: Motion) => {
  if (motion.zoom) {
    zoom(api, motion.zoom);
  }

  if (motion.panX || motion.panY) {
    pan(api, motion.panX, motion.panY);
  }
};
