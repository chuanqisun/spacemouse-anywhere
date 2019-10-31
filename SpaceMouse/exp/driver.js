class Vector2D {
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

/**
 * Gamepad API wrapper for the SpaceNavigator axes
 */
class SpaceNavigator {
  constructor() {
    navigator.getGamepads(); // first call to trigger connection

    this.spaceNavigator = this.getSpaceNavigator();
  }

  getAxes() {
    const spaceNavigator = this.getSpaceNavigator();
    return spaceNavigator && spaceNavigator.axes ? spaceNavigator.axes : [0, 0, 0, 0, 0, 0];
  }

  getSpaceNavigator() {
    const gamepadList = [...navigator.getGamepads()];
    return gamepadList.find(gamepad => this.isSpaceMouse(gamepad));
  }

  /**
   *
   * @param {Gamepad} gamepad
   */
  isSpaceMouse(gamepad) {
    if (!gamepad) return false;
    if (!gamepad.id) return false;
    if (gamepad.id.indexOf('3Dconnexion Universal Receiver') < 0) return false;
    if (gamepad.axes.length !== 6) return false;

    return true;
  }
}

/**
 * calculating speed and translation at each tick
 */
class PhysicsEngine {
  constructor() {
    this.previousTime = null;
    this.spaceNavigator = new SpaceNavigator();
    this.velocity = new Vector2D(0, 0);
    this.zoom = 1;
    this.friction = 0.2;
    window.requestAnimationFrame(() => this.step());
  }

  step() {
    const nowTime = performance.now();
    const delta = nowTime - this.previousTime;
    this.previousTime = nowTime;
    const [fX, fY, fZ, _3, _4, _5] = this.spaceNavigator.getAxes();

    const mouseForce = new Vector2D(fX, fY);

    if (mouseForce.magnitude > 0) {
      this.velocity = this.velocity.add(mouseForce, 10);
    } else {
      if (this.velocity.magnitude > 0.1) {
        this.velocity = this.velocity.scaleToFactor(1 / delta);
      } else {
        this.velocity = this.velocity.scaleToMagnitude(0);
      }
    }

    const translation = this.velocity.scaleToFactor(delta * 0.5);

    parent.postMessage({ pluginMessage: { type: 'mouse-update', x: translation.x, y: translation.y } }, '*');

    window.requestAnimationFrame(() => this.step());
  }
}

new PhysicsEngine();

document.addEventListener('mousewheel', function(event) {
  console.log('scroll hijack');
  event.preventDefault();
});
