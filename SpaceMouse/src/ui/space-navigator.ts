/**
 * Gamepad API wrapper for the SpaceNavigator axes
 */
export class SpaceNavigator {
	getData() {
		const { status, axes } = this._update();
		return { status, axes };
	}

	_update() {
		const spaceNavigator = this._getSpaceNavigator();
		let { status, axes } = { status: "", axes: [0, 0, 0, 0, 0, 0] };

		if (spaceNavigator && spaceNavigator.axes) {
			axes = [...spaceNavigator.axes];
			if (axes.every((item) => item === 0)) {
				status = "Idle";
			} else {
				status = "Active";
			}
		} else {
			axes = [0, 0, 0, 0, 0, 0];
			status = "Disconnected";
		}

		return { status, axes };
	}

	_getSpaceNavigator() {
		const gamepadList = [...navigator.getGamepads()];
		return gamepadList.find((gamepad) => this.isSpaceMouse(gamepad));
	}

	/**
	 *
	 * @param {Gamepad} gamepad
	 */
	isSpaceMouse(gamepad) {
		if (!gamepad) return false;
		if (!gamepad.id) return false;
		if (!gamepad.axes) return false;
		if (gamepad.axes.length !== 6) return false;

		const gamepadName = gamepad.id.toLowerCase();

		// id filter is borrowed from https://github.com/arpruss/spacemouse-tinkercad/blob/master/spacenav.js
		const isIdRecognized =
			(gamepadName.indexOf("vendor: 046d") > -1 && gamepadName.indexOf("product: c6") > -1) ||
			(gamepadName.indexOf("vendor: 256f") > -1 && gamepadName.indexOf("product: c6") > -1) ||
			gamepadName.indexOf("spacenavigator") > -1 ||
			gamepadName.indexOf("space navigator") > -1 ||
			gamepadName.indexOf("spacemouse") > -1 ||
			gamepadName.indexOf("space mouse") > -1;

		return isIdRecognized;
	}
}
