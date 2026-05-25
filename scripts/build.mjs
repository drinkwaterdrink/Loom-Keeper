import { build } from 'esbuild';
import path from 'node:path';

const target = process.argv[2];
const root = process.cwd();
const configs = {
  backend: {
    absWorkingDir: root,
    entryPoints: [path.resolve(root, 'src/backend.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2020',
    outfile: path.resolve(root, 'dist/backend.js'),
  },
  frontend: {
    absWorkingDir: root,
    entryPoints: [path.resolve(root, 'src/frontend.ts')],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    outfile: path.resolve(root, 'dist/frontend.js'),
  },
};

if (!target || !configs[target]) {
  throw new Error('Usage: node ./scripts/build.mjs <backend|frontend>');
}

await build(configs[target]);
