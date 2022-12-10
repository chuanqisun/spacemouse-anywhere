# Observations

- App main thread congestion for large models
- No access to navigator gamepad API from any worker threads (Web Worker, Service Worker, Extension Worker)
- IFrame is the only option left for creating new thread context
- Device input can be scanned at a much higher rate than the output can handle

# Solutions

- Backend
  - IFrame, scans the mouse at an unbounded variable refresh rate
  - Performs all the heavy lifting compute to reduce the load from the main (render) thread
  - Integrate and buffer the transformations on scene/camera
  - The integrated result can be consumed by a buffer reader
- Frontend
  - Inject script to the main thread and read from backend buffer at a variable rate that is bounded by the `requestAnimationFrame`
  - Apply the integrated transformation from the buffer to the scene/camera
