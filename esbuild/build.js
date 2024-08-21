import AdmZip from 'adm-zip';
import esbuild from 'esbuild';
import { contentScriptOptions, iconsDirectoryOptions, optionsPageOption, OUT_DIR, PACKAGE_NAME, popupPageOptions } from './options.js';

export const zipBuildArtifacts = () => {
  const zip = new AdmZip();
  zip.addLocalFolder(OUT_DIR, '.');
  zip.addLocalFile('manifest.json');
  zip.writeZip(PACKAGE_NAME);
}

Promise.all([
  // backgroundScriptOptions,
  contentScriptOptions,
  optionsPageOption,
  popupPageOptions,
  iconsDirectoryOptions,
]
  .map(esbuild.build))
  .then(() => zipBuildArtifacts())
  .catch(console.log);