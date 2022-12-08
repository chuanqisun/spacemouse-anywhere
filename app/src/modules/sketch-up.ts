export async function getApi() {
  return new Promise<SketchUpWebApi>((resolve) => {
    const intervalHandle = setInterval(() => {
      console.log("?", (() => globalThis.Module)());
      if (globalThis.Module) {
        clearInterval(intervalHandle);
        console.log("!");
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
