figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === "mouse-update") {
        if (msg.zoomMultiplier !== 1) {
            figma.viewport.zoom = figma.viewport.zoom * msg.zoomMultiplier;
        }
        const { x, y } = figma.viewport.center;
        const newX = x + msg.x / figma.viewport.zoom;
        const newY = y + msg.y / figma.viewport.zoom;
        if (newX !== x || newY !== y) {
            figma.viewport.center = { x: newX, y: newY };
        }
    }
    if (msg.type === "preferences-update") {
        console.log("[code] preferences written to storage");
        figma.clientStorage.setAsync("preferences", msg.preferences);
        // post back the latest preferences
        figma.ui.postMessage({
            type: "preferences-available",
            preferences: msg.preferences,
        });
    }
    if (msg.type === "get-preferences") {
        figma.clientStorage.getAsync("preferences").then((preferences) => {
            figma.ui.postMessage({
                type: "preferences-available",
                preferences,
            });
        });
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
