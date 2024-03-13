/* eslint-env node */

module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
      plugins: ['transform-es2015-modules-commonjs'],
    },
  },
};
