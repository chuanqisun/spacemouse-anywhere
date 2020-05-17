const del = require("del");

function postBuildCleanUp(cb) {
	del("./dist/ui.js").then(() => cb());
}

module.exports = postBuildCleanUp;
