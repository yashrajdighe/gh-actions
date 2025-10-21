const core = require("@actions/core");
// const github = require("@actions/github");
const simpleGit = require("simple-git");
const git_user = "backup-bot";

const clone = async () => {
  try {
    const token = core.getInput("token");
    const repository = core.getInput("repository");
    const [owner, repo] = repository.split("/");

    const remote = `https://${git_user}:${token}@${owner}/${repo}.git`;

    simpleGit()
      .clone(remote)
      .then(() => console.log("finished"))
      .catch((err) => console.error("failed: ", err));

    // const octokit = github.getOctokit(token);

    // Get repository information
    // const { data: repoData } = await octokit.rest.repos.get({
    //   owner,
    //   repo,
    // });

    // core.info(`Backing up repository: ${repoData.full_name}`);

    // Here you would add the logic to back up the repository,
    // such as cloning it to a local directory or pushing it to another remote.

    // core.info(`Repository ${repoData.full_name} backed up successfully.`);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
};

const main = async () => {
  try {
    await clone();
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
