import { useDeviceContext } from "../contexts/device-context";
import { usePreferencesContext } from "../contexts/preferences-context";
import { PhysicsEngine } from "../core/physics-engine";
import { useEffect } from "haunted";

const physicsEngine = new PhysicsEngine();

export function useCanvasUpdate() {
	const { axes } = useDeviceContext();
	const { preferences } = usePreferencesContext();

	useEffect(() => {
		physicsEngine.usePreferences(preferences);
	}, [preferences]);

	useEffect(() => {
		physicsEngine.update(axes);
	}, [axes]);
}
