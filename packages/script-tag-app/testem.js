'use strict';

const path = require('path');

const qunitDomMain = path.relative('../..', require.resolve('qunit-dom'));
const qunitDomJs = path.join(path.dirname(qunitDomMain), 'dist/qunit-dom.js');

const fractalMain = path.relative('../..', require.resolve('fractal-page-object'));
const fractalJs = path.join(path.dirname(fractalMain), 'fractal-page-object.js');

const relToHere = path.relative('../..', '.');

module.exports = {
  launch_in_ci: [
    'Chrome',
  ],
  launch_in_dev: [
    'Chrome',
  ],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  },
  'framework': 'qunit',
  'test_page': `${relToHere}/index.mustache`,
  'cwd': '../..',
  'serve_files': [
    qunitDomJs,
    fractalJs,
    `${relToHere}/tests.js`
  ]
};
