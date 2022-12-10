import { GamepadStatus, getGamepadSnapshot, selectSpaceMouse } from "./modules/device";
import { tick } from "./utils/tick";

export default async function main() {
  const statusElement = document.getElementById("status") as HTMLElement;
  const xElement = document.getElementById("x") as HTMLMeterElement;
  const yElement = document.getElementById("y") as HTMLMeterElement;
  const zElement = document.getElementById("z") as HTMLMeterElement;
  const rxElement = document.getElementById("rx") as HTMLMeterElement;
  const ryElement = document.getElementById("ry") as HTMLMeterElement;
  const rzElement = document.getElementById("rz") as HTMLMeterElement;

  const handleClick = (e: Event) => {
    const action = (e.target as HTMLElement)?.closest(`[data-action]`)?.getAttribute("data-action");
    switch (action) {
      case "reload":
        return chrome.runtime.reload();
    }
  };

  const decodeStatus = (status: GamepadStatus) => {
    switch (status) {
      case GamepadStatus.Active:
        return "Active";
      case GamepadStatus.Disconnected:
        return "Disconnected";
      case GamepadStatus.Idle:
        return "Idle";
    }
  };

  const updateVisualization = (meter: HTMLMeterElement, value: number) => {
    const deadZone = 0;
    const maxOut = 1;

    meter.value = value;

    if (Math.abs(value) <= deadZone) {
      meter.optimum = value ? Math.sign(value) : 1;
    } else if (Math.abs(value) >= maxOut) {
      meter.optimum = -Math.sign(value);
    } else {
      meter.optimum = value;
    }
  };

  const onTick = () => {
    const snapshot = getGamepadSnapshot(selectSpaceMouse);
    statusElement.innerText = decodeStatus(snapshot.status);
    const [x, y, z, rx, ry, rz] = snapshot.axes;
    updateVisualization(xElement, x);
    updateVisualization(yElement, y);
    updateVisualization(zElement, z);
    updateVisualization(rxElement, rx);
    updateVisualization(ryElement, ry);
    updateVisualization(rzElement, rz);
  };

  window.addEventListener("click", handleClick);

  tick(onTick);
}

main();
