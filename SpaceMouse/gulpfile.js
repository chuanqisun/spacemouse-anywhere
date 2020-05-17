const gulp = require("gulp");
const { parallel, series, watch } = require("gulp");

const { buildMain } = require("./scripts/build-main");
const { buildHtmlDev, buildHtmlProd } = require("./scripts/build-html");
const { buildUiScript } = require("./scripts/build-ui-script");
const { postBuildCleanUp } = require("./scripts/post-build-clean-up");

gulp.task("dev", () => watch("src/**/*", { ignoreInitial: false }, parallel(buildMain, series(buildUiScript, buildHtmlDev, postBuildCleanUp))));
gulp.task("build", parallel(buildMain, series(buildUiScript, buildHtmlProd, postBuildCleanUp)));
