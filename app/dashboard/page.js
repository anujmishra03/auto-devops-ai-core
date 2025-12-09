"use client";
import { useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueResult, setIssueResult] = useState(null);

  // PR state
  const [prLoading, setPrLoading] = useState(false);
  const [prResult, setPrResult] = useState(null);

  const scanRepo = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAiResult(null);
    setIssueResult(null);
    setPrResult(null);

    try {
      const res = await axios.post("/api/scan", { repo, token });
      setResult(res.data);

      if (res.data.error) {
        setError(res.data.github_message || res.data.error);
        return;
      }

      const aiRes = await axios.post("/api/ai/decide", res.data);
      setAiResult(aiRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createIssueFromNextAction = async () => {
    if (!aiResult || !aiResult.next_action) {
      alert("Run AI first to get next_action");
      return;
    }
    if (!token) {
      alert("GitHub token is required to create an issue");
      return;
    }

    setIssueLoading(true);
    setError("");
    setIssueResult(null);

    try {
      const title = `AutoDevOpsAI: ${aiResult.next_action}`;
      const bodyLines = [
        "This issue was created automatically by AutoDevOps AI 🤖",
        "",
        `Repo: ${result?.full_name || repo}`,
        `Health Score: ${aiResult.score}/100`,
        "",
        "Primary suggested action:",
        `- ${aiResult.next_action}`,
        "",
        "Other suggestions:",
        ...(aiResult.suggestions || []).map((s) => `- ${s}`),
      ];

      const res = await axios.post("/api/github/create-issue", {
        repo,
        token,
        title,
        body: bodyLines.join("\n"),
      });

      setIssueResult(res.data);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      setError(
        data?.github_message ||
          data?.error ||
          err.message ||
          "Unknown error"
      );
    } finally {
      setIssueLoading(false);
    }
  };

  // 🔧 create PR from next_action
  const createPrFromNextAction = async () => {
    if (!aiResult || !aiResult.next_action) {
      alert("Run AI first to get next_action");
      return;
    }
    if (!token) {
      alert("GitHub token is required to create a PR");
      return;
    }

    setPrLoading(true);
    setError("");
    setPrResult(null);

    try {
      const res = await axios.post("/api/github/create-pr", {
        repo,
        // token,
        next_action: aiResult.next_action,
      });

      console.log("PR API RESPONSE:", res.data);
      setPrResult(res.data);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      setError(
        data?.github_message ||
          data?.error ||
          err.message ||
          "Unknown error"
      );
    } finally {
      setPrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold">🔍 Scan a GitHub Repo</h1>

      <input
        placeholder="GitHub repo URL (e.g. https://github.com/yourname/yourrepo)"
        className="mt-4 w-full p-3 bg-gray-800 rounded"
        onChange={(e) => setRepo(e.target.value)}
      />

      <input
        placeholder="GitHub Token (required to create issues/PRs)"
        className="mt-4 w-full p-3 bg-gray-800 rounded"
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={scanRepo}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "⏳ Running..." : "🚀 Run AutoDevOps Scan + AI"}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-800 rounded">
          <p className="font-bold">⚠ Error</p>
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-10 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold">Repo Summary</h2>
          <pre className="mt-3 text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {aiResult && (
        <div className="mt-10 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold">🔮 AI Suggestions</h2>

          <p className="mt-2 text-gray-300">
            Health Score:{" "}
            <span className="font-semibold">{aiResult.score}/100</span>
          </p>

          <ul className="mt-3 list-disc list-inside text-sm text-gray-200 space-y-1">
            {aiResult.suggestions?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-green-400">
            ✅ Next action:{" "}
            <span className="font-semibold">{aiResult.next_action}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={createIssueFromNextAction}
              disabled={issueLoading}
              className="px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50"
            >
              {issueLoading
                ? "⏳ Creating GitHub Issue..."
                : "📝 Create Issue from Next Action"}
            </button>

            <button
              onClick={createPrFromNextAction}
              disabled={prLoading}
              className="px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:opacity-50"
            >
              {prLoading
                ? "⏳ Creating PR..."
                : "🔧 Auto-Fix via Pull Request"}
            </button>
          </div>
        </div>
      )}

      {issueResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h2 className="text-lg font-bold">✅ Issue Created</h2>
          <p className="mt-2 text-sm">
            Issue #{issueResult.number} created successfully.
          </p>
          <a
            href={issueResult.issue_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-blue-400 underline"
          >
            Open Issue on GitHub
          </a>
        </div>
      )}

      {prResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          {prResult.pr_url ? (
            <>
              <h2 className="text-lg font-bold">✅ Pull Request Created</h2>
              <a
                href={prResult.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
              >
                🔗 Open PR on GitHub
              </a>
              <p className="mt-2 text-xs text-gray-400 break-all">
                {prResult.pr_url}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold">⚠ Failed to create PR</h2>
              <p className="mt-2 text-sm text-red-300">
                {prResult.github_message ||
                  prResult.error ||
                  "Unknown error from GitHub"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
