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
class PhysicsEngine {}

const spaceNavigator = new SpaceNavigator();

var start = null;
var element = document.getElementById('SomeElementYouWantToAnimate');

function step(timestamp) {
  console.log(spaceNavigator.getAxes());
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
