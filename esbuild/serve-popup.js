import esbuild from 'esbuild';
import { makeProductionBuild, popupSettings } from './settings.js';
import open from 'open';

const context = await esbuild.context(popupSettings);

context.watch();
let { host, port } = await context.serve({ servedir: 'out' });

const url = `http://${host}:${port}`;
console.log("Watching files...");
console.log(`Serving files at ${url}`);

open(url + '/popup.html');