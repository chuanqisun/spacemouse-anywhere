const { inlineSource } = require("inline-source");
const path = require("path");
const htmlpath = path.resolve("src/ui.html");
const targetHtmlPath = path.resolve("dist/ui.html");
const fs = require("fs");

const buildHtmlFactory = ({ compress = false } = {}) => {
	const buildHtml = (cb) => {
		inlineSource(htmlpath, { compress }).then((html) => fs.writeFile(targetHtmlPath, html, cb));
	};

	return buildHtml;
};

const buildHtmlDev = buildHtmlFactory();
const buildHtmlProd = buildHtmlFactory({ compress: true });

module.exports = { buildHtmlDev, buildHtmlProd };
