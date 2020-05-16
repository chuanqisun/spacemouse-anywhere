class UserInterface {
    constructor() {
        this.rootStyle = document.documentElement.style;
        this.statusElement = document.getElementById("status");
        this.preferencesFormElement = document.getElementById("preferences-form");
        this.openPreferencesButton = document.getElementById("open-preferences");
        this.closePreferencesButton = document.getElementById("close-preferences");
        this.resetPreferencesButton = document.getElementById("reset-preferences");
        this.openPreferencesButton.addEventListener("click", () => this.preferencesFormElement.classList.add("active"));
        this.closePreferencesButton.addEventListener("click", () => this.preferencesFormElement.classList.remove("active"));
        this.resetPreferencesButton.addEventListener("click", () => this.resetPreferences());
        this.preferencesFormElement.addEventListener("change", (e) => this.updateValues(e));
    }
    usePreferences({ invertX, invertY, panSensitivity, zoomSensitivity }) {
        const oldPreferences = this.getPreferences();
        if (invertX !== undefined && oldPreferences.invertX !== invertX) {
            document.querySelector('[name="invertX"]').checked = invertX;
        }
        if (invertY !== undefined && oldPreferences.invertY !== invertY) {
            document.querySelector('[name="invertY"]').checked = invertY;
        }
        if (panSensitivity !== undefined && oldPreferences.panSensitivity !== panSensitivity) {
            document.querySelector('[name="panSensitivity"]').value = panSensitivity;
            document.querySelector('[name="panSensitivity"]').setAttribute("value", parseInt(panSensitivity) > 0 ? `+${panSensitivity}` : panSensitivity);
        }
        if (zoomSensitivity !== undefined && oldPreferences.zoomSensitivity !== zoomSensitivity) {
            document.querySelector('[name="zoomSensitivity"]').value = zoomSensitivity;
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
            invertX: document.querySelector('[name="invertX"]').checked,
            invertY: document.querySelector('[name="invertY"]').checked,
            panSensitivity: document.querySelector('[name="panSensitivity"]').value,
            zoomSensitivity: document.querySelector('[name="zoomSensitivity"]').value,
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
        parent.postMessage({
            pluginMessage: {
                type: "preferences-update",
                preferences,
            },
        }, "*");
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

/**
 * Gamepad API wrapper for the SpaceNavigator axes
 */
class SpaceNavigator {
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
            }
            else {
                status = "Active";
            }
        }
        else {
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
        if (!gamepad)
            return false;
        if (!gamepad.id)
            return false;
        if (!gamepad.axes)
            return false;
        if (gamepad.axes.length !== 6)
            return false;
        const gamepadName = gamepad.id.toLowerCase();
        // id filter is borrowed from https://github.com/arpruss/spacemouse-tinkercad/blob/master/spacenav.js
        const isIdRecognized = (gamepadName.indexOf("vendor: 046d") > -1 && gamepadName.indexOf("product: c6") > -1) ||
            (gamepadName.indexOf("vendor: 256f") > -1 && gamepadName.indexOf("product: c6") > -1) ||
            gamepadName.indexOf("spacenavigator") > -1 ||
            gamepadName.indexOf("space navigator") > -1 ||
            gamepadName.indexOf("spacemouse") > -1 ||
            gamepadName.indexOf("space mouse") > -1;
        return isIdRecognized;
    }
}

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
        }
        else {
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
 * calculating speed and translation at each tick
 */
class PhysicsEngine {
    constructor() {
        this.previousTime = null;
        this.velocity = new Vector2D(0, 0);
        this.zoomMultiplier = 1;
        this.preferences = {
            invertX: false,
            invertY: false,
            panSensitivity: 0,
            zoomSensitivity: 0,
        };
    }
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
        parent.postMessage({
            pluginMessage: {
                type: "mouse-update",
                x,
                y,
                zoomMultiplier,
            },
        }, "*");
    }
    updateVelocity(delta, fX, fY) {
        const mouseForce = new Vector2D(fX, fY);
        if (mouseForce.magnitude > 0) {
            // this.velocity = this.velocity.add(mouseForce, 5);
            this.velocity = mouseForce.scaleToFactor(20);
        }
        else {
            if (this.velocity.magnitude > 0.1) {
                this.velocity = this.velocity.scaleToFactor(1 / delta);
            }
            else {
                this.velocity = this.velocity.scaleToMagnitude(0);
            }
        }
    }
    updateZoomMultiplier(delta, fZ) {
        if (fZ > 0) {
            this.zoomMultiplier = Math.min(1 + fZ / 10, 1.05);
        }
        else if (fZ < 0) {
            this.zoomMultiplier = Math.max(1 + fZ / 8, 0.92);
        }
        else {
            this.zoomMultiplier = 1;
        }
    }
}

class Application {
    constructor() {
        this.userInterface = new UserInterface();
        this.spaceNavigator = new SpaceNavigator();
        this.physicsEngine = new PhysicsEngine();
        window.requestAnimationFrame(() => this.update());
        this.requestPreferences();
    }
    usePreferences(preferences) {
        console.log("[ui] new preference available");
        this.userInterface.usePreferences(preferences);
        this.physicsEngine.usePreferences(preferences);
    }
    requestPreferences() {
        parent.postMessage({
            pluginMessage: {
                type: "get-preferences",
            },
        }, "*");
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

const application = new Application();
onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (msg.type === "preferences-available") {
        if (msg.preferences) {
            application.usePreferences(msg.preferences);
        }
    }
};
