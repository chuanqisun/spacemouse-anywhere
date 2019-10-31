figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'mouse-update') {
    let { x, y } = figma.viewport.center;
    console.log(x, y);
    console.log(msg.deltaX);
    x = x + msg.deltaX / figma.viewport.zoom;
    figma.viewport.center = { x, y };
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
