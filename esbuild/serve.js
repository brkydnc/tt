import esbuild from 'esbuild';
import { popupPageOptions, OUT_DIR, optionsPageOption, backgroundScriptOptions, contentScriptOptions } from './options.js';
import open from 'open';

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

esbuild.context(TARGET_OPTIONS)
  .then(context => {
    context.watch();
    console.log("Watching files...");
    return context;
  })
  .then(context => context.serve({
    servedir: OUT_DIR
  }))
  .then(({ host, port }) => {
    const url = `http://${host}:${port}`;
    console.log(`Serving files at ${url}`);
    open(`${url}/${TARGET}/index.html`);
  })
  .catch(console.log);