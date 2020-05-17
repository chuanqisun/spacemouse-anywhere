const buildHtmlFactory = ({ compress = false } = {}) => (cb) => {
	const { inlineSource } = require("inline-source");
	const path = require("path");
	const htmlpath = path.resolve("src/ui.html");
	const targetHtmlPath = path.resolve("dist/ui.html");
	const fs = require("fs");

	inlineSource(htmlpath, { compress }).then((html) => fs.writeFile(targetHtmlPath, html, cb));
};

module.exports = buildHtmlFactory;
