export const runtime = "nodejs";

import axios from "axios";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// normalize repo input → owner/name
function extractRepoName(input) {
  let repo = input.trim();
  if (repo.includes("github.com")) repo = repo.split("github.com/")[1];
  repo = repo.replace(/^\/+|\/+$/g, "").replace(".git", "");
  return repo;
}

// branch naming must match your PR-branch scheme
function getBranchName(next_action) {
  return "autodevops-" + next_action.toLowerCase().replace(/\s+/g, "-");
}

// list root files and pick first JS/TS file
async function pickTargetFile(repoName, branchName, token) {
  const res = await axios.get(
    `https://api.github.com/repos/${repoName}/contents`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { ref: branchName },
    }
  );

  const files = res.data || [];
  const candidates = files.filter(
    (f) =>
      f.type === "file" &&
      (f.name.endsWith(".js") ||
        f.name.endsWith(".jsx") ||
        f.name.endsWith(".ts") ||
        f.name.endsWith(".tsx"))
  );

  if (!candidates.length) return null;
  // simple: choose first one
  return candidates[0].path;
}

export async function POST(req) {
  try {
    const { repo, token, next_action } = await req.json();

    if (!repo || !token || !next_action) {
      return Response.json(
        { ok: false, error: "repo, token & next_action required" },
        { status: 200 }
      );
    }

    const repoName = extractRepoName(repo);
    const branchName = getBranchName(next_action);

    // 1) pick target code file
    const filePath = await pickTargetFile(repoName, branchName, token);
    if (!filePath) {
      return Response.json(
        {
          ok: false,
          error: "No JS/TS files found in repo root for auto-fix",
        },
        { status: 200 }
      );
    }

    // 2) fetch file content from that branch
    const fileRes = await axios.get(
      `https://api.github.com/repos/${repoName}/contents/${filePath}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { ref: branchName },
      }
    );

    const existingSha = fileRes.data.sha;
    const existingCode = Buffer.from(fileRes.data.content, "base64").toString(
      "utf8"
    );

    // 3) ask Groq to refactor / clean code
    const prompt = `
You are AutoDevOps AI. You receive a source code file from a GitHub repository.

Tasks:
- Keep the same behavior.
- Improve naming, formatting, and structure.
- Add small helpful comments for complex logic.
- Remove obvious dead code.
- Prefer modern JavaScript/TypeScript style.
- Do NOT add huge new features, keep the changes safe.
- Output ONLY the full updated file content, no explanations.

Here is the file:

---
${existingCode}
---
`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const newCode = chat.choices[0].message.content || existingCode;

    // 4) commit back to same branch
    const putBody = {
      message: "AutoDevOpsAI: Auto-fix code via AI",
      content: Buffer.from(newCode).toString("base64"),
      branch: branchName,
      sha: existingSha,
    };

    const commitRes = await axios.put(
      `https://api.github.com/repos/${repoName}/contents/${filePath}`,
      putBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return Response.json(
      {
        ok: true,
        file: filePath,
        branch: branchName,
        commit_url: commitRes.data.commit?.html_url || null,
      },
      { status: 200 }
    );
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.message || err.message;

    console.error("❌ Auto-fix code error:", status, msg);

    return Response.json(
      {
        ok: false,
        error: "Failed to auto-fix code",
        github_message: msg,
        status,
      },
      { status: 200 }
    );
  }
}
