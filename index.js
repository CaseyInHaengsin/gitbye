import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import { execa } from "execa";


async function main() {
  const { branches, dir } = await identifyCurrentDirectoryAndBranches()
  if (!branches.length || branches.length === 0) {
    console.log("No branches to delete");
    return;
  }
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "answer",
        message: "Which branches would you like to delete?",
        question: "What is your name?",
        choices: branches.map((branch) => ({
          name: branch,
          message: branch,
        })),
      },
    ])
    .then(async (answers) => {
      const toDelete = answers.answer;
      if (!toDelete) return;
      await Promise.all(
        toDelete.map(
          async (branch) =>
            await execa("git", ["branch", "-D", branch], {
              cwd: dir
            })
        )
      );
    });
}

async function identifyCurrentDirectoryAndBranches(){
  const { directory }  = await inquirer.prompt([
    {
      type: "input",
      name: "directory",
      message: "What is the directory you want to delete branches in?",
      default: "CWD"

    }
  ])
  const dir = directory === 'CWD' || directory === '.'  ? process.cwd() : directory
  const isGitRepo = await isGitRepository(dir);
  if (!isGitRepo) {
    throw new Error("Not a git repository");
  }
  const branches = await getBranches(dir);
  return { branches, dir }

}

async function isGitRepository(dirPath) {
  try {
    const gitDirPath = path.join(dirPath, ".git");
    const gitDirStat = fs.statSync(gitDirPath);
    if (!gitDirStat.isDirectory()) {
      return false;
    }

    await execa("git", ["status"], { cwd: dirPath });
    return true;
  } catch (error) {
    return false;
  }
}

async function getBranches(cwd) {
  const { stdout: branches } = await execa("git", ["branch"], {
    cwd
  });
  return branches
    .split("\n")
    .map((s) => s.trim())
    .filter(
      (branch) => !["main", "master", "* master", "* main"].includes(branch)
    );
}

await main();
