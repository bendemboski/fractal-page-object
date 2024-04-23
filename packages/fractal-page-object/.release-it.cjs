/* eslint-env node */

module.exports = {
  scripts: {
    "after:bump": "yarn docs"
  },
  plugins: {
    '@release-it-plugins/lerna-changelog': {
      infile: 'CHANGELOG.md',
    },
  },
  git: {
    commitMessage: 'v${version}',
    tagName: 'v${version}',
  },
  github: {
    release: true,
    releaseName: 'v${version}',
    tokenRef: 'GITHUB_AUTH',
  },
};
