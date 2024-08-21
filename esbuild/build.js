import AdmZip from 'adm-zip';
import esbuild from 'esbuild';
import { contentScriptOptions, iconsDirectoryOptions, optionsPageOption, OUT_DIR, PACKAGE_NAME, popupPageOptions } from './options.js';

export const zipBuildArtifacts = () => {
  const zip = new AdmZip();
  zip.addLocalFolder(OUT_DIR, '.');
  zip.addLocalFile('manifest.json');
  zip.writeZip(PACKAGE_NAME);
}

export const ALL = [
  // backgroundScriptOptions,
  contentScriptOptions,
  optionsPageOption,
  popupPageOptions,
  iconsDirectoryOptions,
];

Promise.all(ALL.map(esbuild.build))
  .then(() => zipBuildArtifacts())
  .catch(console.log);