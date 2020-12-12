'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'script',
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
