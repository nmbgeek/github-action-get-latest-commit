const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

const repository = core.getInput('repository');
const token = core.getInput('token');
const branch = core.getInput('branch');
var owner = core.getInput('owner');
var repo = core.getInput('repo');

const octokit = (() => {
  if (token) {
    return new Octokit({ auth: token });
  } else {
    return new Octokit();
  }
})();

async function run() {
  try {
    if (repository) {
      [owner, repo] = repository.split('/');
    }
    var commits = await octokit.repos.listCommits({
      owner: owner,
      repo: repo,
      sha: branch,
    });
    commits = commits.data;

    if (commits.length) {
      console.log(commits);
      core.setOutput('shorthash', commits[0].sha.slice(0, 7));
      core.setOutput('hash', String(commits[0].sha));
      core.setOutput('description', String(commits[0].commit.message));
    } else {
      core.setFailed('Error');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
