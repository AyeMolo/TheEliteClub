export async function POST(req: Request) {
  try {
    const { resume } = await req.json()

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
              text: `Based on this resume, generate optimized LinkedIn content. Return ONLY valid JSON (no markdown, no code fences):

{
  "headline": "A punchy LinkedIn headline under 120 characters. Should highlight role + value prop + key skill.",
  "summary": "A 3-4 sentence LinkedIn About section. First person, confident, results-driven. Reference specific skills and achievements from the resume. End with what they're looking for or passionate about."
}

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
