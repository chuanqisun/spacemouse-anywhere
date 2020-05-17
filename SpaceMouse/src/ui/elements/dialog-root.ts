import { html, component, useEffect } from "haunted";
import { Application } from "../application";
import { useEngineContext } from "../contexts/engine";

function DialogRoot() {
	const { status } = useEngineContext();

	return html`
		<div class="ui">
			<div>${status}</div>
			<button>toggle size</button>
		</div>
	`;
}

customElements.define("nv-dialog-root", component(DialogRoot));
