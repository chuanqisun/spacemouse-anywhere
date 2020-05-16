const gulp = require("gulp");
const rollup = require("rollup");
const rollupTypescript = require("@rollup/plugin-typescript");
const injectInline = require("@exuanbo/gulp-inject-inline");

gulp.task("build:code.js", () => {
	return rollup
		.rollup({
			input: "./src/code.ts",
			plugins: [rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/code.js",
			});
		});
});

gulp.task("build:ui.js", () => {
	return rollup
		.rollup({
			input: "./src/ui.ts",
			plugins: [rollupTypescript()],
		})
		.then((bundle) => {
			return bundle.write({
				file: "./dist/ui.js",
			});
		});
});

gulp.task("inject", () => {
	return gulp.src("src/ui.html").pipe(injectInline()).pipe(gulp.dest("dist"));
});
