figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'mouse-update') {
    figma.viewport.zoom = figma.viewport.zoom * msg.zoom;

    let { x, y } = figma.viewport.center;
    x = x + msg.x / figma.viewport.zoom;
    y = y + msg.y / figma.viewport.zoom;
    figma.viewport.center = { x, y };
  }

  // console.log(figma.viewport.zoom);

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
