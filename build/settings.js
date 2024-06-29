import esbuild from 'esbuild';
import { html } from '@esbuilder/html'

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
  entryPoints: [
    "src/popup/popup.html",
  ],
  plugins: [html({
    entryNames: 'popup/[name]',
  })],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: "out",
  assetNames: 'popup/[name]',
}

export const optionsSettings = {
  entryPoints: [
    "src/options/options.html",
  ],
  plugins: [html({
    entryNames: 'options/[name]',
  })],
  bundle: true,
  write: true,
  minify: true,
  sourcemap: true,
  outdir: "out",
  assetNames: 'options/[name]',
}

await Promise.all([backgroundSettings, contentSettings, optionsSettings, popupSettings].map(esbuild.build));