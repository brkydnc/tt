import html from "@esbuilder/html";

const PACKAGE_NAME = "tt.xpi";

export const makeProductionBuild = settings => ({
  ...settings,
  define: { "window.__IS_PRODUCTION_BUILD": "true" },
});

export const packageArtifacts = () => {
  const zip = new AdmZip();
  zip.addLocalFolder('out', 'out');
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
  outdir: "out",
}

export const popupSettings = {
  entryPoints: ["src/popup/popup.html",],
  plugins: [html()],
  bundle: true,
  write: true,
  sourcemap: true,
  outdir: "out",
  assetNames: '[name]',
}

export const optionsSettings = {
  entryPoints: [
    "src/options/options.html",
  ],
  plugins: [html()],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: "out",
  assetNames: '[name]',
}