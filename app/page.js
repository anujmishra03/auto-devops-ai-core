export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-5xl font-bold text-center">
        AutoDevOps AI 🔥
      </h1>
      <p className="mt-4 text-lg text-gray-300 text-center max-w-xl">
        An AI DevOps Engineer that analyzes your GitHub repo,
        fixes issues, writes docs, creates CI workflows & deploys automatically.
      </p>

      <a href="/dashboard" className="mt-8 px-6 py-3 bg-blue-600 rounded-lg text-xl hover:bg-blue-500">
        🚀 Launch Dashboard
      </a>
    </div>
  );
}
