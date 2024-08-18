import AdmZip from 'adm-zip';

export const PACKAGE_NAME = "tt.xpi";
export const OUT_DIR = "build";

export const makeProductionBuild = settings => ({
  ...settings,
  define: { "window.__IS_PRODUCTION_BUILD": "true" },
});

export const packageArtifacts = () => {
  const zip = new AdmZip();
  zip.addLocalFolder(OUT_DIR, '.');
  zip.addLocalFolder('icons', 'icons');
  zip.addLocalFile('manifest.json');
  zip.writeZip(PACKAGE_NAME);
}

export const backgroundSettings = {
  entryPoints: [
    "src/background/background.js",
  ],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: "out",
  platform: "browser",
}

export const contentSettings = {
  entryPoints: [
    "src/content/content.js",
    "src/content/content.css",
    "src/utils.js",
  ],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: OUT_DIR,
  platform: "browser",
}

export const popupSettings = {
  entryPoints: [
    "src/popup/index.tsx",
    "src/popup/index.html",
    "src/popup/index.css",
  ],
  outdir: OUT_DIR,
  loader: {
    '.html': 'copy',
    '.css': 'copy'
  },
  entryNames: 'popup/[name]',
  write: true,
  bundle: true,
  sourcemap: true,
  minify: true,
}

export const optionsSettings = {
  entryPoints: [
    "src/options/options.html",
  ],
  plugins: [],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: OUT_DIR,
  assetNames: '[name]',
  platform: "browser",
}