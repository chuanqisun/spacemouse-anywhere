import { Vector2D } from "./vector-2d";

/**
 * calculating speed and translation at each tick
 */
export class PhysicsEngine {
	private previousTime = null;
	private velocity = new Vector2D(0, 0);
	private zoomMultiplier = 1;
	private preferences = {
		invertX: false,
		invertY: false,
		panSensitivity: 0,
		zoomSensitivity: 0,
	};

	usePreferences(preferences) {
		this.preferences = {
			invertX: preferences.invertX,
			invertY: preferences.invertY,
			panSensitivity: parseInt(preferences.panSensitivity),
			zoomSensitivity: parseInt(preferences.zoomSensitivity),
		};
	}

	applyPreferences(translation, zoomMultiplier) {
		let finalX = translation.x;
		let finalY = translation.y;
		let finalZoomMultiplier = zoomMultiplier;

		if (this.preferences.invertX) {
			finalX = -finalX;
		}

		if (this.preferences.invertY) {
			finalY = -finalY;
		}

		finalX = finalX * (1 + this.preferences.panSensitivity / 5);
		finalY = finalY * (1 + this.preferences.panSensitivity / 5);
		finalZoomMultiplier = finalZoomMultiplier + ((finalZoomMultiplier - 1) * this.preferences.zoomSensitivity) / 5;

		return {
			x: finalX,
			y: finalY,
			zoomMultiplier: finalZoomMultiplier,
		};
	}

	update([fX, fY, fZ]) {
		const nowTime = performance.now();
		const delta = nowTime - this.previousTime;
		this.previousTime = nowTime;

		this.updateVelocity(delta, fX, fY);
		this.updateZoomMultiplier(delta, fZ);
		const translation = this.velocity.scaleToFactor(delta * 0.5);

		const { x, y, zoomMultiplier } = this.applyPreferences(translation, this.zoomMultiplier);
		parent.postMessage(
			{
				pluginMessage: {
					type: "mouse-update",
					x,
					y,
					zoomMultiplier,
				},
			},
			"*"
		);
	}

	updateVelocity(delta, fX, fY) {
		const mouseForce = new Vector2D(fX, fY);

		if (mouseForce.magnitude > 0) {
			// this.velocity = this.velocity.add(mouseForce, 5);
			this.velocity = mouseForce.scaleToFactor(20);
		} else {
			if (this.velocity.magnitude > 0.1) {
				this.velocity = this.velocity.scaleToFactor(1 / delta);
			} else {
				this.velocity = this.velocity.scaleToMagnitude(0);
			}
		}
	}

	updateZoomMultiplier(delta, fZ) {
		if (fZ > 0) {
			this.zoomMultiplier = Math.min(1 + fZ / 10, 1.05);
		} else if (fZ < 0) {
			this.zoomMultiplier = Math.max(1 + fZ / 8, 0.92);
		} else {
			this.zoomMultiplier = 1;
		}
	}
}
