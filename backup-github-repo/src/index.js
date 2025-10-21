import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const { exec } = require("child_process");

const s3Client = new S3Client({});

const core = require("@actions/core");
// const github = require("@actions/github");
const simpleGit = require("simple-git");
const gitUser = "backup-bot";
const bucketName = "common-yashrajdighe-git-repo-backup";

const clone = async () => {
  try {
    const token = core.getInput("token");
    const repository = core.getInput("repository");
    const [owner, repo] = repository.split("/");

    const remote = `https://${gitUser}:${token}@github.com/${owner}/${repo}.git`;

    simpleGit()
      .clone(remote) // `./${repo}.git`
      .then(() => console.log(`Clone successful for ${repository}`))
      .catch((err) => console.error("failed: ", err));
    exec("ls -al");
    exec("pwd");
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    error;
  }
};

const createTarZst = async (sourceDir, outputFile) => {
  const command = `tar -I zstd -cvf ${outputFile} -C ${sourceDir} .`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating tar.zst: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
};

const uploadToS3 = async (bucketName, key, body) => {
  const putObjectParams = {
    Bucket: bucketName,
    Key: key,
    Body: body,
  };

  try {
    await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log(`Successfully uploaded ${key} to ${bucketName}`);
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
};

const main = async () => {
  try {
    await clone();
    const repoName = `${core.getInput("repository").split("/")[1]}.git`;
    const archiveName = `${repoName}.tar.zst`;
    await createTarZst(`./${repoName}`, archiveName);

    // const fs = require("fs");
    // const fileStream = fs.createReadStream(archiveName);

    // await uploadToS3(bucketName, archiveName, fileStream);

    // fs.unlinkSync(archiveName);
  } catch (error) {
    core.setFailed(error.message);
    error;
  }
};

main();
