export class Vector2D {
	private x: number;
	private y: number;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	get magnitude() {
		return Math.hypot(this.x, this.y);
	}

	scaleToMagnitude(magnitude) {
		if (this.magnitude === 0) {
			return new Vector2D(0, 0);
		} else {
			const scaleFactor = magnitude / this.magnitude;
			return new Vector2D(this.x * scaleFactor, this.y * scaleFactor);
		}
	}

	scaleToFactor(factor) {
		return new Vector2D(this.x * factor, this.y * factor);
	}

	add(vector, maxMagnitude = Infinity) {
		let netX = this.x + vector.x;
		let netY = this.y + vector.y;
		const newMagnitude = Math.hypot(netX, netY);
		if (newMagnitude > maxMagnitude) {
			netX = (netX * maxMagnitude) / newMagnitude;
			netY = (netY * maxMagnitude) / newMagnitude;
		}
		return new Vector2D(netX, netY);
	}

	toString() {
		return `<x: ${this.x}, y: ${this.y}>`;
	}

	toObject() {
		return { x: this.x, y: this.y };
	}
}
