/**
 * Debugging:
 *   https://eslint.org/docs/latest/use/configure/debug
 *  ----------------------------------------------------
 *
 *   Print a file's calculated configuration
 *
 *     npx eslint --print-config path/to/file.js
 *
 *   Inspecting the config
 *
 *     npx eslint --inspect-config
 *
 */
import globals from 'globals';
import js from '@eslint/js';

import prettier from 'eslint-plugin-prettier/recommended';
import n from 'eslint-plugin-n';

export default [
  js.configs.recommended,
  prettier,
  /**
   * Ignores must be in their own object
   * https://eslint.org/docs/latest/use/configure/ignore
   */
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '!**/.*'],
  },
  /**
   * https://eslint.org/docs/latest/use/configure/configuration-files#configuring-linter-options
   */
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  /**
   * In-browser files
   */
  {
    files: ['tests.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  /**
   * CJS node files
   */
  {
    files: ['testem.js'],
    plugins: {
      n,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
