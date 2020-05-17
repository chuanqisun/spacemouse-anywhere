const rollup = require("rollup");
const rollupTypescript = require("@rollup/plugin-typescript");
const nodeResolve = require("@rollup/plugin-node-resolve");

function buildUiScript(cb) {
	rollup
		.rollup({
			input: "./src/ui.ts",
			plugins: [nodeResolve(), rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/ui.js",
			});
		})
		.then(() => cb());
}

module.exports = { buildUiScript };
