'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'script',
    requireConfigFile: false,
  },
  extends: [
    'eslint:recommended',
  ],
  env: {
    browser: true,
  },
  overrides: [
    // node files
    {
      files: ['.eslintrc.js', 'testem.js'],
      env: {
        browser: false,
        node: true,
      },
    },
  ],
};
