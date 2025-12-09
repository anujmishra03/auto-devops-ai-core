# AutoDevOps AI Core

AutoDevOps AI Core is a Next.js app that connects to GitHub, scans repositories,
and automatically creates issues and pull requests to improve project health
(e.g., fixing README, adding CI, etc).

It uses:
- Next.js (App Router)
- GitHub REST API
- (Optional) AI provider (e.g. Groq/OpenAI) for deciding next actions

---

## Features

- 🔍 Scan a GitHub repository and compute a "health" score
- 🤖 Decide the "next action" using AI (e.g., "Add CI workflow", "Improve README")
- 🧾 Automatically create GitHub issues with actionable descriptions
- 🔀 Automatically create branches, commit changes, and open pull requests
- 🧪 CI via GitHub Actions (Node.js) to validate changes

---

## Tech Stack

- **Frontend / API**: Next.js 16 (App Router)
- **Language**: JavaScript
- **CI**: GitHub Actions
- **GitHub Integration**: GitHub REST API with PAT

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/auto-devops-ai-core.git
cd auto-devops-ai-core
dependencies npm install
cp .env.example .env.local
run npm run dev
