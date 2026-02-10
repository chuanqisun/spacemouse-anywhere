# SpaceMouse Anywhere

Bring your 3DConnexion SpaceMouse to your favorite web apps! See details for each app.

- [SketchUp for Web](./apps/sketchup)
- [Figma](./apps/figma)

## macOS: WebSocket proxy

On macOS the Gamepad API may not detect the SpaceMouse. Use [spacemouse-proxy](https://github.com/bimawa/spacemouse-proxy) — a lightweight Rust service that reads SpaceMouse data via the native 3DConnexion framework and streams it over WebSocket.

```sh
cargo install spacemouse-proxy
spacemouse-proxy --install
```

Then open the Figma plugin, go to **Preferences** and switch the input source to **WebSocket**.

The proxy automatically yields control to other 3D apps (Blender, Maya, etc.) when Figma is not in the foreground.
