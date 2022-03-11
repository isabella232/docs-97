var getRepoInfo = require('git-repo-info');
var Octokit = require("@octokit/rest").Octokit;
var Promise = require('bluebird');
var semver = require('semver');
var github;

/**
 * Setup the Github API helper objects and authenticate them.
 *
 * @param {String} githubToken The Github access token.
 */
exports.setupGitApi = function setupGitApi(githubToken) {
  if (github) {
    return;
  }
  github = new Octokit({
    auth: githubToken,
    timeout: 5000,
    headers: {
      'user-agent': 'Handsontable'
    }
  });
};

/**
 * Get information about local repository.
 *
 * @returns {Object}
 */
exports.getLocalInfo = function getLocalInfo() {
  return getRepoInfo();
};

/**
 * Get latest Handsontable release version based on passed semver range.
 *
 * @param {String} [range=false] Semver range version
 * @returns {Promise}
 */
exports.getHotLatestRelease = function getHotLatestRelease(range) {
  return new Promise(function(resolve, reject) {
    github.rest.repos.listReleases({
      owner: 'handsontable',
      repo: 'handsontable',
      page: 1,
      per_page: 100
    }).then(function(resp) {
      if (range) {
        resp = resp.data.filter(function(release) {
          return semver.satisfies(release.tag_name, range);
        });
      }

      resolve(resp.data.length ? resp.data[0] : null);
    }).catch(reject);
  });
};

/**
 * Get all availables docs version
 *
 * @returns {Promise}
 */
exports.getDocsVersions = function getDocsVersions() {
  return new Promise(function(resolve, reject) {
    github.rest.repos.listBranches({
      owner: 'handsontable',
      repo: 'docs',
      page: 1,
      per_page: 100
    }).then(function(resp) {
      var branches;

      branches = resp.data.filter(function(branch) {
        return branch.name.match(/^\d{1,5}\.\d{1,5}\.\d{1,5}(\-(beta|alpha)(\d+)?)?$/) ? true : false;

      }).map(function(branch) {
        return branch.name;

      }).sort(function(a, b) {
        if (semver.gt(a, b)) {
          return 1;
        }
        if (semver.lt(a, b)) {
          return -1;
        }

        return 0;
      });

      resolve(branches);
    }).catch(reject);
  });
};
