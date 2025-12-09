export function extractRepoName(input) {
  let repo = input.trim();

  if (repo.includes("github.com")) {
    repo = repo.split("github.com/")[1];
  }

  repo = repo.replace(/^\/+|\/+$/g, "");

  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  return repo; // owner/repo
}
