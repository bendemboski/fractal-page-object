import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

const typescriptConfiguration = {
  exclude: [
    'node_modules/**',
    'src/**/__tests__/**',
  ],
};

const copyStaticArtifacts = copy({
  targets: [
    { src: '../../README.md', dest: '.' },
    { src: '../../LICENSE', dest: '.' },
  ],
});

const iifeBundle = {
  input: 'src/fractal-page-object.ts',

  plugins: [typescript({
    ...typescriptConfiguration,
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
      }
    }
  }), copyStaticArtifacts],

  output: {
    name: 'FractalPageObject',
    file: 'dist/fractal-page-object.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      'dom-element-descriptors': 'DOMElementDescriptors',
    },
  },

  external: ['dom-element-descriptors'],
};

const esBundle = {
  input: 'src/fractal-page-object.ts',

  plugins: [typescript(typescriptConfiguration)],

  output: {
    file: 'dist/es/index.js',
    format: 'es',
    sourcemap: true,
  },

  external: ['dom-element-descriptors'],
};

export default [iifeBundle, esBundle];
