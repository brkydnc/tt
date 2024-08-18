export const PACKAGE_NAME = "tt.xpi";
export const OUT_DIR = "build";

export const makeProductionBuild = (options) => ({
  ...options,
  define: { "window.__IS_PRODUCTION_BUILD": "true" },
});

const commonOptions = {
  outdir: OUT_DIR,
  write: true,
  bundle: true,
  sourcemap: true,
  minify: true,
  loader: {
    '.html': 'copy',
    '.css': 'copy'
  },
}

export const backgroundScriptOptions = {
  ...commonOptions,
  entryNames: 'background/[name]',
  entryPoints: [
    "src/background/background.js",
  ],
}

export const contentScriptOptions = {
  ...commonOptions,
  entryNames: 'content/[name]',
  entryPoints: [
    "src/content/index.tsx",
    "src/content/index.html",
    "src/content/index.css",
  ],
}

export const popupPageOptions = {
  ...contentScriptOptions,
  entryNames: 'popup/[name]',
  entryPoints: [
    "src/popup/index.tsx",
    "src/popup/index.html",
    "src/popup/index.css",
  ],
}

export const optionsPageOption = {
  ...commonOptions,
  entryNames: 'option/[name]',
  entryPoints: [
    "src/options/options.js",
    "src/options/options.html",
    "src/options/options.css",
  ],
}