export enum MessageTypes {
	MainPreferencesAvailable,
	UIGetPreferences,
	UIResize,
	UIPreferencesUpdate,
	UIMouseUpdate,
}

import { Preferences } from "../contexts/preferences-context";

export function requestStoredPreferences() {
	window.parent.postMessage(
		{
			pluginMessage: {
				type: MessageTypes.UIGetPreferences,
			},
		},
		"*"
	);
}

export function setStoredPreferences(preferences: Preferences) {
	window.parent.postMessage(
		{
			pluginMessage: {
				type: MessageTypes.UIPreferencesUpdate,
				preferences,
			},
		},
		"*"
	);
}

export interface Dimensions {
	width: number;
	height: number;
}

export function resize(dimensions: Dimensions) {
	window.parent.postMessage(
		{
			pluginMessage: {
				type: MessageTypes.UIResize,
				dimensions,
			},
		},
		"*"
	);
}

export interface MouseParameters {
	x: number;
	y: number;
	zoomMultiplier: number;
}

export function updateMouse(mouseParameters: MouseParameters) {
	parent.postMessage(
		{
			pluginMessage: {
				type: MessageTypes.UIMouseUpdate,
				mouseParameters,
			},
		},
		"*"
	);
}
