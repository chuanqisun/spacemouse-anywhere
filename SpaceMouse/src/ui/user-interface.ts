export class UserInterface {
	private rootStyle = document.documentElement.style;

	private statusElement = document.getElementById("status");
	private preferencesFormElement = document.getElementById("preferences-form");
	private openPreferencesButton = document.getElementById("open-preferences");
	private closePreferencesButton = document.getElementById("close-preferences");
	private resetPreferencesButton = document.getElementById("reset-preferences");

	constructor() {
		this.openPreferencesButton.addEventListener("click", () => this.preferencesFormElement.classList.add("active"));
		this.closePreferencesButton.addEventListener("click", () => this.preferencesFormElement.classList.remove("active"));
		this.resetPreferencesButton.addEventListener("click", () => this.resetPreferences());
		this.preferencesFormElement.addEventListener("change", (e) => this.updateValues(e));
	}

	usePreferences({ invertX, invertY, panSensitivity, zoomSensitivity }) {
		const oldPreferences = this.getPreferences();
		if (invertX !== undefined && oldPreferences.invertX !== invertX) {
			(document.querySelector('[name="invertX"]') as HTMLInputElement).checked = invertX;
		}
		if (invertY !== undefined && oldPreferences.invertY !== invertY) {
			(document.querySelector('[name="invertY"]') as HTMLInputElement).checked = invertY;
		}
		if (panSensitivity !== undefined && oldPreferences.panSensitivity !== panSensitivity) {
			(document.querySelector('[name="panSensitivity"]') as HTMLInputElement).value = panSensitivity;
			document.querySelector('[name="panSensitivity"]').setAttribute("value", parseInt(panSensitivity) > 0 ? `+${panSensitivity}` : panSensitivity);
		}
		if (zoomSensitivity !== undefined && oldPreferences.zoomSensitivity !== zoomSensitivity) {
			(document.querySelector('[name="zoomSensitivity"]') as HTMLInputElement).value = zoomSensitivity;
			document.querySelector('[name="zoomSensitivity"]').setAttribute("value", parseInt(zoomSensitivity) > 0 ? `+${zoomSensitivity}` : zoomSensitivity);
		}
	}

	resetPreferences() {
		this.usePreferences({
			invertX: false,
			invertY: false,
			panSensitivity: 0,
			zoomSensitivity: 0,
		});

		this.storePreferences();
	}

	getPreferences() {
		return {
			invertX: (document.querySelector('[name="invertX"]') as HTMLInputElement).checked,
			invertY: (document.querySelector('[name="invertY"]') as HTMLInputElement).checked,
			panSensitivity: (document.querySelector('[name="panSensitivity"]') as HTMLInputElement).value,
			zoomSensitivity: (document.querySelector('[name="zoomSensitivity"]') as HTMLInputElement).value,
		};
	}

	updateValues(e) {
		const target = document.querySelector(`[name="${e.target.name}"]`);

		// reflect property to value
		if (e.target.type === "range") {
			target.setAttribute("value", parseInt(e.target.value) > 0 ? `+${e.target.value}` : e.target.value);
		}

		this.storePreferences();
	}

	storePreferences() {
		const preferences = this.getPreferences();

		parent.postMessage(
			{
				pluginMessage: {
					type: "preferences-update",
					preferences,
				},
			},
			"*"
		);
	}

	updateStatus(status) {
		if (this.statusElement.innerText !== status) {
			this.statusElement.innerText = status;
		}
	}

	updateVisualization([fX, fY, fZ]) {
		this.rootStyle.setProperty("--x", `${fX * 100}px`);
		this.rootStyle.setProperty("--y", `${fY * 100}px`);
		this.rootStyle.setProperty("--z", `${fZ * 50}px`);
	}
}
