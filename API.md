# API from common.js

Pending questions

- Detection screen center (needed for zooming)
- Detect current mode (not be needed if use Ctrl + scroll for zooming)
- Clutching current tool with orbit tool
- Object manipulation

```typescript
interface Module {
  mouseButtonHandler(button: MouseButton, action: MouseButtonAction, x: number, y: number);
  onKeyDown(e: VirtualKeyEvent);
  onKeyUp(e: VirtualKeyEvent);
  scrollHandler(x: number, y: number, deltaX: number, deltaY: number, ctrlKey: boolean);
  mouseMoveHandler(x: number, y: number);
  getViewportDimensions(): { width: number; height: number };
  GetActiveToolId(): number;
  RunCommand(id: number);
  ZoomCommandId: number; // 10509
  PanCommandId: number; //10523
  OrbitCommandId: number; // 10508
}

enum MouseButton {
  LEFT = 0,
}

enum MouseButtonAction {
  DOWN = 0,
  UP = 1,
}

// Left Shift
interface ShiftLeft extends VirtualKeyEvent {
  physicalKey: "ShiftLeft";
  inputChar: 0;
  keyCode: 16;
}
// Left Ctrl
interface CtrlLeft extends VirtualKeyEvent {
  physicalKey: "Ctrl";
  inputChar: 0;
  keyCode: 17;
}

// Mouse mode

// Pan X-Y
Module.onKeyDown({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });
Module.mouseButtonHandler(0, 0, 100, 100);
Module.mouseMoveHandler(100, 200);
Module.mouseButtonHandler(0, 1, 100, 100);
Module.onKeyUp({ physicalKey: "ShiftLeft", keyCode: 16, inputChar: 0 });

// Rotate X-Y
Module.mouseButtonHandler(0, 0, 100, 100);
Module.mouseMoveHandler(100, 200);
Module.mouseButtonHandler(0, 1, 100, 100);

// Zoom (Pan Z)
Module.onKeyDown({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
Module.scrollHandler(1, 1, 0, -100, true);
Module.onKeyUp({ physicalKey: "CtrlLeft", keyCode: 17, inputChar: 0 });
```
