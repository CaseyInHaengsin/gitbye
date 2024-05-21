import inquirer from "inquirer";
import { execa } from "execa";

const CWD = "";

async function main() {
  const branches = await getBranches();

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
              cwd: CWD,
            })
        )
      );
    });
}

async function getBranches() {
  const { stdout: branches } = await execa("git", ["branch"], {
    cwd: CWD,
  });
  return branches
    .split("\n")
    .map((s) => s.trim())
    .filter(
      (branch) => !["main", "master", "* master", "* main"].includes(branch)
    );
}

main();
