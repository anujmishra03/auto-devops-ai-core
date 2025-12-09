export const runtime = "nodejs";

import axios from "axios";

function extractRepoName(input) {
  let repo = input.trim();

  if (repo.includes("github.com")) {
    repo = repo.split("github.com/")[1];
  }

  repo = repo.replace(/^\/+|\/+$/g, ""); // trim slashes
  if (repo.endsWith(".git")) repo = repo.slice(0, -4);

  return repo; // "owner/repo"
}

export async function POST(req) {
  try {
    const { repo, token, title, body } = await req.json();

    if (!repo) {
      return Response.json({ error: "Repo is required" }, { status: 400 });
    }
    if (!token) {
      return Response.json(
        { error: "GitHub token is required to create issues" },
        { status: 400 }
      );
    }

    const repoName = extractRepoName(repo);

    const url = `https://api.github.com/repos/${repoName}/issues`;

    const { data } = await axios.post(
      url,
      {
        title: title || "AutoDevOpsAI: Suggested Improvement",
        body: body || "This issue was created automatically by AutoDevOps AI.",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    return Response.json({
      status: "issue_created",
      issue_url: data.html_url,
      number: data.number,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    return Response.json(
      {
        error: "Failed to create issue",
        status,
        github_message: err.response?.data?.message || err.message,
      },
      { status }
    );
  }
}
