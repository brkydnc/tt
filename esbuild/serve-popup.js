import esbuild from 'esbuild';
import { popupSettings, OUT_DIR } from './settings.js';
import open from 'open';

const context = await esbuild.context(popupSettings);

context.watch();
let { host, port } = await context.serve({ servedir: OUT_DIR });

const url = `http://${host}:${port}`;
console.log("Watching files...");
console.log(`Serving files at ${url}`);

open(url + '/popup/index.html');