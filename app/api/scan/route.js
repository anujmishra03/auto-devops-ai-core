// import axios from "axios"

// export async function POST(req){
//   const { repo, token } = await req.json()

//   try {
//     const repoName = repo.split("github.com/")[1]

//     const data = await axios.get(`https://api.github.com/repos/${repoName}`,{
//       headers:{ Authorization:`Bearer ${token}` }
//     })

//     return Response.json({
//       status:"success",
//       stars: data.data.stargazers_count,
//       forks: data.data.forks,
//       open_issues: data.data.open_issues,
//       visibility: data.data.visibility,
//       ai_summary:"Next: AI will analyze & suggest fixes 🔥"
//     })

//   } catch(err){
//     return Response.json({error:"Failed to fetch repo", details:err.message})
//   }
// }
import axios from "axios"

function extractRepoName(input) {
  let repo = input.trim()

  // If full URL, strip before github.com/
  if (repo.includes("github.com")) {
    repo = repo.split("github.com/")[1]
  }

  // Remove protocol/extra slashes if any left
  repo = repo.replace(/^\/+|\/+$/g, "")  // remove leading/trailing /

  // Remove .git if present
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4)
  }

  return repo  // should be "owner/repo"
}

export async function POST(req) {
  try {
    const { repo, token } = await req.json()

    if (!repo) {
      return Response.json({ error: "Repo is required" }, { status: 400 })
    }

    const repoName = extractRepoName(repo)

    console.log("🧩 Parsed repo name:", repoName)

    const headers = {
      "Accept": "application/vnd.github+json",
    }

    if (token && token.trim() !== "") {
      headers["Authorization"] = `Bearer ${token.trim()}`
    }

    const url = `https://api.github.com/repos/${repoName}`
    console.log("🌐 Calling GitHub:", url)

    const { data } = await axios.get(url, { headers })

    const response = {
      status: "success",
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count ?? data.forks,
      open_issues: data.open_issues_count ?? data.open_issues,
      visibility: data.visibility,
      default_branch: data.default_branch,
      last_push: data.pushed_at,
      ai_summary: "Scan OK ✅ — next step: AI will analyze & suggest actions."
    }

    return Response.json(response)

  } catch (err) {
    console.error("❌ GitHub error:", err.response?.status, err.response?.data || err.message)

    const status = err.response?.status || 500

    return Response.json(
      {
        error: "Failed to fetch repo",
        status,
        github_message: err.response?.data?.message || err.message,
        hint:
          status === 404
            ? "Check if the repo exists and that your token has access (private repos show 404 if unauthorized)."
            : "Check your token, rate limits, or network.",
      },
      { status }
    )
  }
}
