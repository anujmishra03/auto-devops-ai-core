"use client";
import { useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");

  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const [issueResult, setIssueResult] = useState(null);
  const [prResult, setPrResult] = useState(null);
  const [fixResult, setFixResult] = useState(null);

  const [codeFixResult, setCodeFixResult] = useState(null);
  const [testGenResult, setTestGenResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [codeFixLoading, setCodeFixLoading] = useState(false);
  const [testGenLoading, setTestGenLoading] = useState(false);

  const [error, setError] = useState("");

  // 🧹 Clean branch name (important fix)
  const cleanBranchName = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\- ]/g, "") // remove invalid chars (fixes "(12)")
      .replace(/\s+/g, "-") // convert spaces to "-"
      .substring(0, 60);
  };

  // 🔍 SCAN REPO + AI DECISION
  const scanRepo = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAiResult(null);

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
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 CREATE ISSUE
  const createIssueFromNextAction = async () => {
    if (!aiResult?.next_action) return alert("Run AI first");
    if (!token) return alert("GitHub token required");

    setIssueLoading(true);
    setError("");
    setIssueResult(null);

    try {
      const title = `AutoDevOpsAI: ${aiResult.next_action}`;
      const bodyLines = [
        "Created automatically by AutoDevOps AI 🤖",
        "",
        `Repo: ${repo}`,
        `Health Score: ${aiResult.score}/100`,
        "",
        "Primary Action:",
        `- ${aiResult.next_action}`,
        "",
        "Other Suggestions:",
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
      setError(
        err.response?.data?.github_message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setIssueLoading(false);
    }
  };

  // 🔧 CREATE PULL REQUEST
  const createPrFromNextAction = async () => {
    if (!aiResult?.next_action) return alert("Run AI first");
    if (!token) return alert("GitHub token required");

    setPrLoading(true);
    setError("");
    setPrResult(null);

    try {
      const cleaned = cleanBranchName(aiResult.next_action);

      const res = await axios.post("/api/github/create-pr", {
        repo,
        token,
        next_action: cleaned,
      });

      setPrResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.github_message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setPrLoading(false);
    }
  };

  // 📄 AUTO-FIX README
  const autoFixReadme = async () => {
    if (!aiResult?.next_action) return alert("Run AI first");
    if (!token) return alert("GitHub token required");

    setFixLoading(true);
    setError("");
    setFixResult(null);

    try {
      const cleaned = cleanBranchName(aiResult.next_action);

      const res = await axios.post("/api/github/auto-fix-readme", {
        repo,
        token,
        next_action: cleaned,
      });

      setFixResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.github_message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setFixLoading(false);
    }
  };

  // 🛠 AUTO-FIX CODE
  const autoFixCode = async () => {
    if (!aiResult?.next_action) return alert("Run AI first");
    if (!token) return alert("GitHub token required");

    setCodeFixLoading(true);
    setError("");
    setCodeFixResult(null);

    try {
      const cleaned = cleanBranchName(aiResult.next_action);

      const res = await axios.post("/api/github/auto-fix-code", {
        repo,
        token,
        next_action: cleaned,
      });

      setCodeFixResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.github_message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setCodeFixLoading(false);
    }
  };

  // 🧪 AUTO-GENERATE TEST FILES
  const autoGenerateTests = async () => {
    if (!aiResult?.next_action) return alert("Run AI first");
    if (!token) return alert("GitHub token required");

    setTestGenLoading(true);
    setError("");
    setTestGenResult(null);

    try {
      const cleaned = cleanBranchName(aiResult.next_action);

      const res = await axios.post("/api/github/auto-generate-tests", {
        repo,
        token,
        next_action: cleaned,
      });

      setTestGenResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.github_message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setTestGenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold">🤖 AutoDevOps AI Dashboard</h1>

      {/* Inputs */}
      <input
        placeholder="GitHub repo URL"
        className="mt-4 w-full p-3 bg-gray-800 rounded"
        onChange={(e) => setRepo(e.target.value)}
      />

      <input
        placeholder="GitHub Token"
        className="mt-4 w-full p-3 bg-gray-800 rounded"
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={scanRepo}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "⏳ Running..." : "🚀 Scan Repo + AI"}
      </button>

      {/* ERROR */}
      {error && (
        <div className="mt-6 p-4 bg-red-800 rounded">
          <p className="font-bold">⚠ Error</p>
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* RESULT */}
      {aiResult && (
        <div className="mt-10 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold">🔮 AI Suggestions</h2>

          <p className="mt-2">Health Score: {aiResult.score}/100</p>

          <ul className="mt-3 list-disc list-inside text-sm space-y-1">
            {aiResult.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <p className="mt-4 text-green-400 text-sm">
            ✅ Next Action: <b>{aiResult.next_action}</b>
          </p>

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={createIssueFromNextAction}
              disabled={issueLoading}
              className="px-6 py-3 bg-emerald-600 rounded-lg"
            >
              {issueLoading ? "⏳ Creating Issue..." : "📝 Create Issue"}
            </button>

            <button
              onClick={createPrFromNextAction}
              disabled={prLoading}
              className="px-6 py-3 bg-amber-500 text-black rounded-lg"
            >
              {prLoading ? "⏳ Creating PR..." : "🔧 Auto-Fix via PR"}
            </button>

            <button
              onClick={autoFixReadme}
              disabled={fixLoading}
              className="px-6 py-3 bg-pink-500 text-black rounded-lg"
            >
              {fixLoading ? "⏳ Fixing README..." : "🔥 Auto-Fix README"}
            </button>

            <button
              onClick={autoFixCode}
              disabled={codeFixLoading}
              className="px-6 py-3 bg-indigo-500 text-black rounded-lg"
            >
              {codeFixLoading
                ? "⏳ Fixing Code..."
                : "🛠 Auto-Fix Code in PR"}
            </button>

            <button
              onClick={autoGenerateTests}
              disabled={testGenLoading}
              className="px-6 py-3 bg-green-500 text-black rounded-lg"
            >
              {testGenLoading
                ? "⏳ Generating Tests..."
                : "🧪 Auto-Generate Tests"}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS (ISSUE, PR, README FIX, CODE FIX, TEST GEN) */}
      {issueResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h2 className="text-lg font-bold">✅ Issue Created</h2>
          <a
            href={issueResult.issue_url}
            target="_blank"
            className="text-blue-400 underline"
          >
            Open Issue
          </a>
        </div>
      )}

      {prResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          {prResult.pr_url ? (
            <>
              <h2 className="text-lg font-bold">✅ PR Created</h2>
              <a
                href={prResult.pr_url}
                target="_blank"
                className="text-purple-400 underline"
              >
                View PR
              </a>
            </>
          ) : (
            <p className="text-red-300">{prResult.error}</p>
          )}
        </div>
      )}

      {fixResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          {fixResult.ok ? (
            <>
              <h2 className="text-lg font-bold">✅ README Fixed</h2>
              <a
                href={fixResult.commit_url}
                target="_blank"
                className="text-indigo-400 underline"
              >
                View Commit
              </a>
            </>
          ) : (
            <p className="text-red-300">{fixResult.error}</p>
          )}
        </div>
      )}

      {codeFixResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          {codeFixResult.ok ? (
            <>
              <h2 className="text-lg font-bold">✅ Code Auto-Fixed</h2>
              <p>Updated file: {codeFixResult.file}</p>
              <a
                href={codeFixResult.commit_url}
                target="_blank"
                className="text-indigo-400 underline"
              >
                View Commit
              </a>
            </>
          ) : (
            <p className="text-red-300">{codeFixResult.error}</p>
          )}
        </div>
      )}

      {testGenResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          {testGenResult.ok ? (
            <>
              <h2 className="text-lg font-bold">✅ Tests Generated</h2>
              <p>Added: {testGenResult.file}</p>
              <a
                href={testGenResult.commit_url}
                target="_blank"
                className="text-green-400 underline"
              >
                View Commit
              </a>
            </>
          ) : (
            <p className="text-red-300">{testGenResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
