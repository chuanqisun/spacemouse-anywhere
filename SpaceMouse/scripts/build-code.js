function buildCode(cb) {
	const rollup = require("rollup");
	const rollupTypescript = require("@rollup/plugin-typescript");

	return rollup
		.rollup({
			input: "./src/code.ts",
			plugins: [rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/code.js",
			});
		})
		.then(() => cb());
}

module.exports = buildCode;
