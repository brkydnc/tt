import { sassPlugin, postcssModules } from "esbuild-sass-plugin";

import path from "node:path";

export const PACKAGE_NAME = "tt.xpi";
export const OUT_DIR = "build";

export const makeProductionBuild = (options) => ({
  ...options,
  define: { "window.__IS_PRODUCTION_BUILD": "true" },
});

const esbuildSassPluginImportMappings = {
  "@styles/": "./src/styles/",
  "@assets/": "./src/assets/",
};

// Resolve import aliases in SCSS files.
const esbuildSassPluginImportMapper = importPath => {
  for (const [k, v] of Object.entries(esbuildSassPluginImportMappings)) {
    importPath = importPath.replace(k, path.resolve(process.cwd(), v) + "/");
  }

  return importPath;
}
const esbuildSassPluginOptionsForScssModules = {
  transform: postcssModules({}),
  importMapper: esbuildSassPluginImportMapper,
}

const commonOptions = {
  outdir: OUT_DIR,
  write: true,
  bundle: true,
  sourcemap: true,
  minify: true,
  metafile: true,
  plugins: [
    sassPlugin(esbuildSassPluginOptionsForScssModules),
  ],
  loader: {
    '.html': 'copy',
    '.ttf': 'copy',
    ".png": "file",
  },
  assetNames: "[dir]/[name]",
  outbase: "src",
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
  ],
  plugins: [
    sassPlugin({
      filter: /index\.scss$/,
      type: 'css-text',
    }),
    sassPlugin({
      filter: /\.module\.scss$/,
      ...esbuildSassPluginOptionsForScssModules,
    }),
  ],
}

export const popupPageOptions = {
  ...commonOptions,
  entryNames: 'popup/[name]',
  entryPoints: [
    "src/popup/index.tsx",
    "src/popup/index.html",
  ],
}

export const optionsPageOption = {
  ...commonOptions,
  entryNames: 'options/[name]',
  entryPoints: [
    "src/options/options.js",
    "src/options/options.html",
  ],
}

// Icons are not imported anywhere, so we define a rule for them.
export const iconsDirectoryOptions = {
  ...commonOptions,
  entryNames: 'assets/icons/[name]',
  entryPoints: [
    "src/assets/icons/*",
  ],
  loader: {
    ".png": "copy",
  }
}