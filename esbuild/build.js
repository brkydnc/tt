import AdmZip from 'adm-zip';
import esbuild from 'esbuild';
import { contentScriptOptions, optionsPageOption, OUT_DIR, PACKAGE_NAME, popupPageOptions } from './options.js';

export const zipBuildArtifacts = () => {
  const zip = new AdmZip();
  zip.addLocalFolder(OUT_DIR, '.');
  zip.addLocalFolder('icons', 'icons');
  zip.addLocalFile('manifest.json');
  zip.writeZip(PACKAGE_NAME);
}

Promise.all([
  // backgroundScriptOptions,
  contentScriptOptions,
  optionsPageOption,
  popupPageOptions,
]
  .map(esbuild.build))
  .then(() => zipBuildArtifacts())
  .catch(console.log);