import { UserInterface } from "./user-interface";
import { SpaceNavigator } from "./space-navigator";
import { PhysicsEngine } from "./physics-engine";

export class Application {
	private userInterface = new UserInterface();
	private spaceNavigator = new SpaceNavigator();
	private physicsEngine = new PhysicsEngine();

	constructor() {
		window.requestAnimationFrame(() => this.update());

		this.requestPreferences();
	}

	usePreferences(preferences) {
		console.log("[ui] new preference available");
		this.userInterface.usePreferences(preferences);
		this.physicsEngine.usePreferences(preferences);
	}

	requestPreferences() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "get-preferences",
				},
			},
			"*"
		);
	}

	update() {
		const { status, axes } = this.spaceNavigator.getData();
		const [fX, fY, fZ] = axes;

		this.physicsEngine.update([fX, fY, fZ]);
		this.userInterface.updateStatus(status);
		this.userInterface.updateVisualization([fX, fY, fZ]);

		window.requestAnimationFrame(() => this.update());
	}
}

// By default tilt will be used for vertical scrolling. Prevent the default to avoid conflict gesture
document.addEventListener("mousewheel", function (event) {
	event.preventDefault();
});
