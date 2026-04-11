import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../');

describe('Deployment configuration', () => {
  it('render.yaml exists', () => {
    expect(existsSync(resolve(root, 'render.yaml'))).toBe(true);
  });

  it('render.yaml references static site type', () => {
    const yaml = readFileSync(resolve(root, 'render.yaml'), 'utf-8');
    expect(yaml).toContain('type: web');
    expect(yaml).toContain('dist');
  });

  it('render.yaml uses npm run build and package.json uses node vite.js', () => {
    const yaml = readFileSync(resolve(root, 'render.yaml'), 'utf-8');
    expect(yaml).toContain('npm run build');
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toContain('node ./node_modules/vite/bin/vite.js build');
  });

  it('package.json build script uses node vite.js', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toContain('node ./node_modules/vite/bin/vite.js build');
  });

  it('no .env files with secrets in project', () => {
    expect(existsSync(resolve(root, '.env'))).toBe(false);
    expect(existsSync(resolve(root, '.env.local'))).toBe(false);
  });

  it('vitest config uses pool: forks', () => {
    const viteConfig = readFileSync(resolve(root, 'vitest.config.ts'), 'utf-8');
    expect(viteConfig).toContain("pool: 'forks'");
  });
});
