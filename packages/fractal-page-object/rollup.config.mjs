import typescript from 'rollup-plugin-typescript2';

const iifeBundle = {
  input: 'src/index.ts',

  plugins: [typescript()],

  output: {
    name: 'FractalPageObject',
    file: 'dist/fractal-page-object.js',
    format: 'iife',
    sourcemap: true,
  },
};

const esBundle = {
  input: 'src/index.ts',

  plugins: [typescript()],

  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
  },
};

export default [iifeBundle, esBundle];
