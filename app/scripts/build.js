import { exec } from "child_process";
import chkoidar from "chokidar";
import esbuild from "esbuild";
import path from "path";
import { promisify } from "util";
import { define } from "./env.js";
import { copyDir, filterDir, getDirEntryPath, readJson, rmDir } from "./fs.js";

const isDev = process.argv.includes("--dev");
const isWatch = process.argv.includes("--watch");

const constants = {
  OUT_DIR: `dist`, // relative to cwd
  UNPACKED_OUT_DIR: `dist/unpacked`, // relative to cwd
  PUBLIC_DIR: `public`, // relative to cwd
  SRC_DIR: `src`, // relative to cwd
  PAGE_ENTRIES: ["popup.ts", "proxy.ts"], // relative to src
  CONTENT_SCRIPT_ENTRIES: ["boot-loader.ts", "content-injection.ts"], // relative to src
  WORKER_ENTRIES: ["background.ts"],
};

buildOnce().then(() => {
  if (isWatch) {
    console.log("Watching...");
    chkoidar.watch(["src/**/*", "public/**/*"], { ignoreInitial: true }).on("all", buildOnce);
  }
});

function buildOnce() {
  return build().then(pack);
}

async function build() {
  console.log("[build] build started");

  // Prebuild clean-up
  console.log(`[build] remove ${constants.OUT_DIR}`);
  await rmDir(constants.OUT_DIR);

  // Listing sources
  const srcDir = path.resolve(constants.SRC_DIR);
  const getSrcEntryPath = getDirEntryPath.bind(null, srcDir);
  const filterInSrcDir = filterDir.bind(null, srcDir);

  const pageEntries = await filterInSrcDir((dirent) => constants.PAGE_ENTRIES.includes(dirent.name));
  const pagePaths = pageEntries.map(getSrcEntryPath);
  console.log(`[build] pages`, pagePaths);

  const workerEntries = await filterInSrcDir((dirent) => constants.WORKER_ENTRIES.includes(dirent.name));
  const workerPaths = workerEntries.map(getSrcEntryPath);
  console.log(`[build] workers`, workerPaths);

  const contentScriptEntries = await filterInSrcDir((dirent) => constants.CONTENT_SCRIPT_ENTRIES.includes(dirent.name));
  const contentScriptPaths = contentScriptEntries.map(getSrcEntryPath);
  console.log(`[build] content scripts`, contentScriptPaths);

  const mainBuild = esbuild
    .build({
      entryPoints: pagePaths,
      bundle: true,
      format: "esm",
      sourcemap: true,
      loader: {
        ".html": "text",
      },
      minify: !isDev,
      define,
      outdir: constants.UNPACKED_OUT_DIR,
    })
    .catch(() => process.exit(1))
    .then(() => console.log(`[build] main built`));

  const contentScriptBuild = esbuild
    .build({
      entryPoints: contentScriptPaths,
      bundle: true,
      format: "iife",
      sourcemap: isDev ? "inline" : true,
      globalName: "_contentScriptGlobal",
      footer: { js: "_contentScriptGlobal.default()" }, // this allows the default export to be returned to global scope
      minify: !isDev,
      outdir: path.join(constants.UNPACKED_OUT_DIR),
    })
    .catch(() => process.exit(1))
    .then(() => console.log(`[build] content script built`));

  const workerBuild = esbuild
    .build({
      entryPoints: workerPaths,
      bundle: true,
      format: "iife",
      sourcemap: isDev ? "inline" : true,
      loader: {
        ".graphql": "text",
      },
      minify: !isDev,
      define,
      outdir: constants.UNPACKED_OUT_DIR,
    })
    .catch(() => process.exit(1))
    .then(() => console.log(`[build] worker built`));

  const assetCopy = (async () => {
    const publicSrcDir = path.resolve(constants.PUBLIC_DIR);
    const { targetPaths } = await copyDir(publicSrcDir, constants.UNPACKED_OUT_DIR);
    console.log("[build] assets copied", targetPaths);
  })();

  await Promise.all([mainBuild, contentScriptBuild, workerBuild, assetCopy]);
  console.log(`[build] build success`);
}

async function pack() {
  const execAsync = promisify(exec);
  console.log("[pack] extension dir", path.resolve(constants.UNPACKED_OUT_DIR));
  const manifest = await readJson(path.resolve(constants.UNPACKED_OUT_DIR, "manifest.json"));
  const version = manifest.version;
  const outFilename = `sketchup-web-spacemouse-${version}.chrome.zip`;

  await execAsync(`zip -r ../${outFilename} .`, { cwd: constants.UNPACKED_OUT_DIR });

  console.log(`[pack] packed: ${outFilename}`);
}
