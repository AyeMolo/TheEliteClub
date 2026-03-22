export async function POST(req: Request) {
  try {
    const { resume, industry } = await req.json()

    if (!resume || !industry) {
      return Response.json({ error: "Resume and industry are required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Benchmark this resume against industry standards for the "${industry}" industry. Return ONLY valid JSON (no markdown, no code fences):

{
  "industry": "${industry}",
  "fit_score": 75,
  "verdict": "One sentence summary of how well they fit this industry",
  "strengths_for_industry": ["strength relevant to this industry", "another"],
  "gaps_for_industry": ["what they're missing for this industry", "another"],
  "in_demand_skills": ["top skills recruiters in this industry want right now"],
  "salary_range_industry": "$XX,000 - $XX,000",
  "recommendation": "2-3 sentence advice on how to position themselves for this industry"
}

Be realistic and honest. Base the fit_score on how well their actual skills and experience match what this industry needs.

Resume:
${resume}`
            }]
          }]
        })
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return Response.json({ error: data.error?.message || "API request failed" }, { status: response.status })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return Response.json({ error: "No response from AI" }, { status: 502 })
    }

    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return Response.json({ result: parsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
