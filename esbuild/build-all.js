import esbuild from 'esbuild';
import { packageArtifacts } from './settings';

// Bundle
await Promise.all([
  backgroundSettings,
  contentSettings,
  optionsSettings,
  popupSettings
].map(esbuild.build));

// Package
packageArtifacts();