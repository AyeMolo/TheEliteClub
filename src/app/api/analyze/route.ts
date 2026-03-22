export async function POST(req: Request) {
  try {
    const { resume, jobDescription } = await req.json()

    if (!resume || typeof resume !== "string" || resume.trim().length === 0) {
      return Response.json({ error: "Resume text is required" }, { status: 400 })
    }

    const hasJob = jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 0

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this resume and return ONLY valid JSON (no markdown, no code fences) with these exact keys:
{
  "resume_score": 72,
  "soc_code": "15-1252",
  "soc_title": "Software Developers",
  "salary_estimate": "estimated salary range",
  "experience_level": "junior/mid/senior/lead",
  "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "recommendation": "career advice paragraph",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "rewritten_summary": "A strong, rewritten professional summary (2-3 sentences) that the candidate could use on their resume. Make it results-driven, confident, and tailored to their skills and experience."${hasJob ? `,
  "screening_call_probability": 75,
  "interview_probability": 60,
  "job_match_score": 85,
  "matching_skills": ["skill that matches the job", "another match"],
  "missing_skills": ["skill the job wants but resume lacks"],
  "job_fit_summary": "paragraph about how well the candidate fits this specific role"` : ""}
}

resume_score: Rate the resume 0-100 based on clarity, impact, formatting, skill relevance, and experience depth. Be honest and realistic.
soc_code: The closest Standard Occupational Classification (SOC) code for this person's role (e.g. "15-1252" for Software Developers, "13-2011" for Accountants). Use the 6-digit format with dash.
soc_title: The official BLS occupation title for that SOC code.

Resume:
${resume}${hasJob ? `\n\nJob Description:\n${jobDescription}` : ""}`,
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Gemini API request failed" },
        { status: response.status }
      )
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