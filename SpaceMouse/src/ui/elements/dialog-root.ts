import { component, html, useState, useEffect, useLayoutEffect } from "haunted";
import { useDeviceContext } from "../contexts/device-context";
import { useCanvasUpdate } from "./use-update-canvas";
import { resize } from "../core/messages";

function DialogRoot(this: HTMLElement) {
	const { status } = useDeviceContext();

	const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);

	useLayoutEffect(() => {
		resize({ width: isPreferencesExpanded ? 400 : 100, height: isPreferencesExpanded ? 300 : 60 });
	}, [isPreferencesExpanded]);

	useCanvasUpdate();

	return html`
		<div class="ui">
			<div>${status}</div>
			<button @click=${() => setIsPreferencesExpanded(!isPreferencesExpanded)}>toggle size</button>

			${isPreferencesExpanded ? html`<nv-preferences></nv-preferences>` : ""}
		</div>
	`;
}

customElements.define("nv-dialog-root", component(DialogRoot));
