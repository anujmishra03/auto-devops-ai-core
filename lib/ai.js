import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function aiSuggestActions(data) {
  const prompt = `
You are AutoDevOps AI.

Analyze this GitHub repository and return ONLY a bullet list of actions:

Stars: ${data.stars}
Open Issues: ${data.open_issues}
Visibility: ${data.visibility}
Last Push: ${data.last_push}
Health Score: ${data.score}/100

Rules:
- Output ONLY bullet points.
- Each line must start with "-" or "•".
- No intro text, no explanation, no headings.
- Each action must be short and actionable (e.g. "Add CI pipeline", "Improve README").
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = res.choices[0].message.content || "";

    // Split into lines and keep only bullet-like ones
    let lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let bullets = lines
      .filter((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*"))
      .map((l) =>
        l
          .replace(/^[-•*]\s*/, "") // remove leading bullet symbol
          .replace(/^\*\*/, "")     // remove starting **
          .replace(/\*\*$/, "")     // remove ending **
          .trim()
      )
      .filter((l) => l.length > 0);

    // Fallback: if model didn't follow instructions, just use lines
    if (bullets.length === 0) {
      bullets = lines;
    }

    return bullets;

  } catch (err) {
    console.error("❌ Groq AI Error:", err.message);
    return [
      "Add CI workflow",
      "Improve README",
      "Write unit tests",
    ];
  }
}
