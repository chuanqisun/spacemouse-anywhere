interface SketchUpWebApi {
  mouseButtonHandler(button: MouseButton, action: MouseButtonAction, x: number, y: number);
  onKeyDown(e: VirtualKeyEvent);
  onKeyUp(e: VirtualKeyEvent);
  scrollHandler(x: number, y: number, deltaX: number, deltaY: number, ctrlKey: boolean);
  mouseMoveHandler(x: number, y: number);
  getViewportDimensions(): { width: number; height: number };
  GetActiveToolId(): number;
  ZoomCommandId: number; // 10509
  PanCommandId: number; //10523
  OrbitCommandId: number; // 10508
}

var Module: SketchUpWebApi;
