import { createContext, useState, useEffect, useCallback, html, component, useContext } from "haunted";
import { SpaceNavigator } from "../core/space-navigator";
import { PhysicsEngine } from "../core/physics-engine";
import { usePreferencesContext } from "./preferences-context";
import { useCanvasUpdate } from "../elements/use-update-canvas";

export interface DeviceContextValue {
	status: string;
	axes: [number, number, number];
}

const DeviceContext = createContext<DeviceContextValue>({
	status: "",
	axes: [0, 0, 0],
});

const spaceNavigator = new SpaceNavigator();

customElements.define("nv-device-provider-internal", DeviceContext.Provider as any);

function DeviceProvider() {
	const [status, setStatus] = useState("unknown");
	const [axes, setAxes] = useState([0, 0, 0]);

	useEffect(() => pollStatus(), []);

	const pollStatus = useCallback(() => {
		const { status, axes } = spaceNavigator.getData();
		const [fX, fY, fZ] = axes;

		setStatus(status);
		setAxes([fX, fY, fZ]);

		window.requestAnimationFrame(() => pollStatus());
	}, []);

	return html`<nv-device-provider-internal .value=${{ status, axes }}>
		<slot></slot>
	</nv-device-provider-internal>`;
}

customElements.define("nv-device-provider", component(DeviceProvider));

/** Get raw readings from the device */
export function useDeviceContext() {
	return useContext(DeviceContext);
}
