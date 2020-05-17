import { createContext, useState, useEffect, useCallback, html, component, useContext } from "haunted";
import { SpaceNavigator } from "../space-navigator";
import { PhysicsEngine } from "../physics-engine";

export interface EngineContextValue {
	status: string;
	axes: [number, number, number, number, number, number];
}

const EngineContext = createContext<EngineContextValue>({
	status: "",
	axes: [0, 0, 0, 0, 0, 0],
});

const spaceNavigator = new SpaceNavigator();
const physicsEngine = new PhysicsEngine();

customElements.define("nv-engine-provider-internal", EngineContext.Provider as any);

function EngineProvider() {
	const [status, setStatus] = useState("unknown");
	const [axes, setAxes] = useState([0, 0, 0, 0, 0, 0]);

	useEffect(() => pollStatus(), []);

	const pollStatus = useCallback(() => {
		const { status, axes } = spaceNavigator.getData();
		const [fX, fY, fZ] = axes;

		physicsEngine.update([fX, fY, fZ]);
		setStatus(status);
		console.log(status);

		window.requestAnimationFrame(() => pollStatus());
	}, []);

	return html`<nv-engine-provider-internal .value=${{ status, axes }}>
		<slot></slot>
	</nv-engine-provider-internal>`;
}

customElements.define("nv-engine-provider", component(EngineProvider));

export function useEngineContext() {
	return useContext(EngineContext);
}
