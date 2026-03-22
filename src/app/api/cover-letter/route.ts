export async function POST(req: Request) {
  try {
    const { resume, jobDescription } = await req.json()

    if (!resume || !jobDescription) {
      return Response.json({ error: "Resume and job description are required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a professional cover letter for this candidate applying to the job below.

Rules:
- 3-4 paragraphs max
- Tailor it specifically to the job description
- Reference actual skills and experience from the resume
- Sound confident but not arrogant
- No generic filler — every sentence should add value
- Do NOT use markdown formatting, just plain text
- Include a proper greeting and sign-off

Resume:
${resume}

Job Description:
${jobDescription}`
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

    return Response.json({ result: text.trim() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
