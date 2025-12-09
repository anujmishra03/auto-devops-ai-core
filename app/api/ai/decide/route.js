import { computeHealthScore } from "@/lib/scorer";
import { aiSuggestActions } from "@/lib/ai";

export async function POST(req) {
  const body = await req.json();
  const score = computeHealthScore(body);

  const suggestions = await aiSuggestActions({
    ...body,
    score
  });

  return Response.json({
    score,
    suggestions,
    next_action: suggestions[0] || "No actions required"
  });
}
