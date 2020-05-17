const rollup = require("rollup");
const rollupTypescript = require("@rollup/plugin-typescript");

function buildMain(cb) {
	return rollup
		.rollup({
			input: "./src/main.ts",
			plugins: [rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/main.js",
			});
		})
		.then(() => cb());
}

module.exports = { buildMain };
