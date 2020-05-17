const gulp = require("gulp");
const { parallel, series, watch } = require("gulp");

const { buildCode } = require("./scripts/build-code");
const { buildHtmlDev, buildHtmlProd } = require("./scripts/build-html");
const { buildUiScript } = require("./scripts/build-ui-script");
const { postBuildCleanUp } = require("./scripts/post-build-clean-up");

gulp.task("dev", () => watch("src/**/*", { ignoreInitial: false }, parallel(buildCode, series(buildUiScript, buildHtmlDev, postBuildCleanUp))));
gulp.task("build", parallel(buildCode, series(buildUiScript, buildHtmlProd, postBuildCleanUp)));
