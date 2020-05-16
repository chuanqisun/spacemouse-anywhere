import { Application } from "./ui/application";

const application = new Application();

onmessage = (event) => {
	const msg = event.data.pluginMessage;
	if (msg.type === "preferences-available") {
		if (msg.preferences) {
			application.usePreferences(msg.preferences);
		}
	}
};
