import { createContext, useState, useEffect, useCallback, html, component, useContext, useMemo } from "haunted";
import { requestStoredPreferences, setStoredPreferences, MessageTypes } from "../core/messages";

export interface PreferencesContextValue {
	preferences: Preferences;
	setPreferences: (preferences: Preferences) => void;
}

export interface Preferences {
	xMapTo: CanvasMovement;
	yMapTo: CanvasMovement;
	zMapTo: CanvasMovement;
	invertX: boolean;
	invertY: boolean;
	invertZ: boolean;
	panSensitivity: number;
	zoomSensitivity: number;
}

export enum CanvasMovement {
	PanX,
	PanY,
	Zoom,
}

const defaultPreferences: Preferences = {
	xMapTo: CanvasMovement.PanX,
	yMapTo: CanvasMovement.PanY,
	zMapTo: CanvasMovement.Zoom,
	panSensitivity: 0,
	zoomSensitivity: 0,
	invertX: false,
	invertY: false,
	invertZ: false,
};

const PreferencesContext = createContext<PreferencesContextValue>({
	preferences: defaultPreferences,
	setPreferences: () => {},
});

customElements.define("nv-preferences-provider-internal", PreferencesContext.Provider as any);

function PreferencesProvider() {
	const [currentPreferences, setCurrentPreferences] = useState<Preferences>(defaultPreferences);

	useEffect(() => {
		window.onmessage = (event) => {
			const msg = event.data.pluginMessage;
			if (msg.type === MessageTypes.MainPreferencesAvailable) {
				if (msg.preferences) {
					console.dir(msg.preferences);
					// TODO wire it up to storage
					setCurrentPreferences(defaultPreferences);
				}
			}
		};

		requestStoredPreferences();
	}, []);

	const setPreferences = useCallback((preferences: Preferences) => {
		setStoredPreferences(preferences);
	}, []);

	const contextValue = useMemo<PreferencesContextValue>(
		() => ({
			preferences: currentPreferences,
			setPreferences,
		}),
		[currentPreferences, setPreferences]
	);

	return html`<nv-preferences-provider-internal .value=${contextValue}>
		<slot></slot>
	</nv-preferences-provider-internal>`;
}

customElements.define("nv-preferences-provider", component(PreferencesProvider));

/** Get raw readings from the device */
export function usePreferencesContext() {
	return useContext(PreferencesContext);
}
