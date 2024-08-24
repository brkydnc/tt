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
  .then(results => {
    for (const result of results) {
      esbuild.analyzeMetafile(result.metafile, { verbose: true })
        .then(console.log)
        .catch(console.log);
    }
  })
  .then(() => zipBuildArtifacts())
  .catch(console.log);