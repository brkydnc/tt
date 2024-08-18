import esbuild from 'esbuild';
import { packageArtifacts, popupSettings } from './settings.js';

// Bundle
await Promise.all([
  //backgroundSettings,
  //contentSettings,
  //optionsSettings,
  popupSettings
].map(esbuild.build));

// Package
packageArtifacts();