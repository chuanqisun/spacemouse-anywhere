import { MessageTypes, MouseParameters, Dimensions } from "./ui/core/messages";

figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.
	if (msg.type === MessageTypes.UIMouseUpdate) {
		const mouseParameters: MouseParameters = msg.mouseParameters;
		if (mouseParameters.zoomMultiplier !== 1) {
			figma.viewport.zoom = figma.viewport.zoom * mouseParameters.zoomMultiplier;
		}

		const { x, y } = figma.viewport.center;
		const newX = x + mouseParameters.x / figma.viewport.zoom;
		const newY = y + mouseParameters.y / figma.viewport.zoom;

		if (newX !== x || newY !== y) {
			figma.viewport.center = { x: newX, y: newY };
		}
	}

	if (msg.type === MessageTypes.UIPreferencesUpdate) {
		console.log("[code] preferences written to storage");
		figma.clientStorage.setAsync("preferences", msg.preferences);

		// post back the latest preferences
		figma.ui.postMessage({
			type: MessageTypes.MainPreferencesAvailable,
			preferences: msg.preferences,
		});
	}

	if (msg.type === MessageTypes.UIGetPreferences) {
		figma.clientStorage.getAsync("preferences").then((preferences) => {
			figma.ui.postMessage({
				type: MessageTypes.MainPreferencesAvailable,
				preferences,
			});
		});
	}

	if (msg.type === MessageTypes.UIResize) {
		const dimensions: Dimensions = msg.dimensions;

		console.log(dimensions.height);

		figma.ui.resize(dimensions.width, dimensions.height);
	}

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	// figma.closePlugin();
};
