export async function POST(req: Request) {
  try {
    const { resume, analysis } = await req.json()

    if (!resume) {
      return Response.json({ error: "Resume is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on this resume and analysis, create a skill learning roadmap. Return ONLY valid JSON (no markdown, no code fences):

{
  "current_level": "junior/mid/senior",
  "target_level": "the next level up",
  "skills": [
    {
      "name": "Skill name",
      "priority": "high/medium/low",
      "reason": "Why this skill matters for their career growth (1 sentence)",
      "time_estimate": "Estimated time to learn (e.g. 2-4 weeks)"
    }
  ]
}

Return 5-8 skills ordered by priority (high first). Focus on skills that will have the biggest career impact based on their current stack and gaps.

Resume:
${resume}

Analysis:
${analysis ? JSON.stringify(analysis, null, 2) : "Not available"}`
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
