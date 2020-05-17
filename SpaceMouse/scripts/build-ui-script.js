function buildUiScript(cb) {
	const rollup = require("rollup");
	const rollupTypescript = require("@rollup/plugin-typescript");

	rollup
		.rollup({
			input: "./src/ui.ts",
			plugins: [rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/ui.js",
			});
		})
		.then(() => cb());
}

module.exports = buildUiScript;
