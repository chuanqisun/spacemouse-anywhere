import { component, html } from "haunted";
import { usePreferencesContext } from "../contexts/preferences-context";
import { useCanvasUpdate } from "./use-update-canvas";

function Preferences() {
	const { preferences } = usePreferencesContext();

	useCanvasUpdate();

	return html`<pre><code>${JSON.stringify(preferences, undefined, 2)}</code></pre>`;
}

customElements.define("nv-preferences", component(Preferences));
