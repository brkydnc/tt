import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { ALL, zipBuildArtifacts } from './build.js';

const contexts = await Promise.all(ALL.map(esbuild.context));

const rebuildAll = async (contexts) => {
  try {
    const jobs = contexts.map(ctx => ctx.rebuild());
    await Promise.all(jobs);
    zipBuildArtifacts();
    console.log("✅ Build successful.")
  } catch (e) {
    console.log("❌ Build failed.")
  }
}

const watcherEventListener = async (contexts) => {
  console.log("⌛️ Rebuilding...");
  return await rebuildAll(contexts);
}

rebuildAll(contexts);

const watcher = chokidar.watch(["src", "manifest.json"], { ignoreInitial: true })
  .on('add', () => watcherEventListener(contexts))
  .on('change', () => watcherEventListener(contexts))
  .on('unlink', () => watcherEventListener(contexts));