import esbuild from 'esbuild';
import open from 'open';
import { OUT_DIR, backgroundScriptOptions, contentScriptOptions, optionsPageOption, popupPageOptions } from './options.js';

const TARGET_OPTIONS_INDEX = {
  "popup": popupPageOptions,
  "options": optionsPageOption,
  "background": backgroundScriptOptions,
  "content": contentScriptOptions,
}

let TARGET = process.env["TARGET"];
let TARGET_OPTIONS = TARGET_OPTIONS_INDEX[TARGET];

if (!TARGET_OPTIONS) {
  TARGET = "popup";
  TARGET_OPTIONS = popupPageOptions;
}

async function serve() {
  const context = await esbuild.context(TARGET_OPTIONS);

  await context.watch();
  console.log("Watching files...");

  const { host, port } = await context.serve({ servedir: OUT_DIR });
  const url = `http://${host}:${port}`;
  console.log(`Serving files at ${url}`);

  open(`${url}/${TARGET}/index.html`);
}

serve().catch(console.error);