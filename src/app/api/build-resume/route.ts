export async function POST(req: Request) {
  try {
    const { name, email, phone, location, education, experience, skills, projects } = await req.json()

    if (!name || !skills) {
      return Response.json({ error: "Name and skills are required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional resume based on the information below. Return ONLY valid JSON (no markdown, no code fences):

{
  "summary": "A strong 2-3 sentence professional summary based on their background",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Date range",
      "bullets": ["Achievement-focused bullet point using action verbs and metrics where possible", "Another bullet"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "school": "School name",
      "year": "Graduation year or expected"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "1-2 sentence description focused on what it does and technologies used"
    }
  ],
  "skills_formatted": ["Skill 1", "Skill 2"]
}

Rules:
- Rewrite experience bullets to be results-driven with action verbs (Built, Led, Designed, Increased, etc.)
- If experience is vague, make it sound professional but don't fabricate specific numbers
- Keep the summary confident and specific to their background
- Format skills as a clean list
- If any section is empty or not provided, return an empty array for it

User Info:
Name: ${name}
Email: ${email || "Not provided"}
Phone: ${phone || "Not provided"}
Location: ${location || "Not provided"}

Education:
${education || "Not provided"}

Experience:
${experience || "Not provided"}

Skills:
${skills}

Projects:
${projects || "Not provided"}`
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

    return Response.json({ result: { ...parsed, name, email, phone, location } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
