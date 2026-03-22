"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface ResumeResult {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: { title: string; company: string; duration: string; bullets: string[] }[];
  education: { degree: string; school: string; year: string }[];
  projects: { name: string; description: string }[];
  skills_formatted: string[];
}

export default function BuildResume() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  async function handleBuild() {
    if (!name.trim() || !skills.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/build-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, location, education, experience, skills, projects }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAll() {
    if (!resumeRef.current) return;
    const text = resumeRef.current.innerText;
    navigator.clipboard.writeText(text);
  }

  function handleReset() {
    setName("");
    setEmail("");
    setPhone("");
    setLocation("");
    setEducation("");
    setExperience("");
    setSkills("");
    setProjects("");
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-white dot-grid py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="text-sm text-gray-400 hover:text-indigo-600 transition">
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">TheEliteClub</h1>
          <div className="w-12" />
        </div>

        {/* Form */}
        {!result && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-1">Build Your Resume</h2>
            <p className="text-sm text-gray-400 mb-6">Fill in what you have — AI will polish and format everything.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Full Name *</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Email</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition"
                  placeholder="john@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Phone</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Location</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition"
                  placeholder="New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Education</label>
              <textarea
                className="w-full h-24 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition resize-none"
                placeholder="e.g. B.S. Computer Science, University of Virginia, 2026"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Experience</label>
              <textarea
                className="w-full h-32 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition resize-none"
                placeholder={"e.g. Software Engineering Intern at Google, Summer 2025\n- Worked on search infrastructure\n- Built internal tooling with React"}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Skills *</label>
              <textarea
                className="w-full h-20 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition resize-none"
                placeholder="e.g. Python, React, Node.js, SQL, Git, Figma"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5 block">Projects</label>
              <textarea
                className="w-full h-28 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition resize-none"
                placeholder={"e.g. TheEliteClub — AI resume analyzer built with Next.js and Gemini API\nTodo App — Full-stack task manager with React and Firebase"}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleBuild}
              disabled={loading || !name.trim() || !skills.trim()}
            >
              {loading ? "Building your resume..." : "Generate Resume"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Generated Resume */}
        {result && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                className="text-xs text-indigo-600 font-medium hover:underline"
                onClick={handleCopyAll}
              >
                Copy All Text
              </button>
              <span className="text-gray-300">|</span>
              <button
                className="text-xs text-gray-400 font-medium hover:underline"
                onClick={() => {
                  if (!result) return;
                  const printWindow = window.open("", "_blank");
                  if (!printWindow) return;

                  const contact = [result.email, result.phone, result.location].filter(Boolean).join("  |  ");

                  const expHtml = result.experience.map(exp => `
                    <div style="margin-bottom: 14px;">
                      <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <strong style="font-size: 11pt;">${exp.title}</strong>
                        <span style="font-size: 9pt; color: #666;">${exp.duration}</span>
                      </div>
                      <div style="font-size: 9.5pt; color: #555; margin-bottom: 4px;">${exp.company}</div>
                      <ul style="margin: 4px 0 0 0; padding-left: 18px;">
                        ${exp.bullets.map(b => `<li style="margin-bottom: 3px; font-size: 10pt;">${b}</li>`).join("")}
                      </ul>
                    </div>
                  `).join("");

                  const eduHtml = result.education.map(edu => `
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                      <div>
                        <strong style="font-size: 10.5pt;">${edu.degree}</strong>
                        <div style="font-size: 9.5pt; color: #555;">${edu.school}</div>
                      </div>
                      <span style="font-size: 9pt; color: #666;">${edu.year}</span>
                    </div>
                  `).join("");

                  const projHtml = result.projects.map(p => `
                    <div style="margin-bottom: 8px;">
                      <strong style="font-size: 10.5pt;">${p.name}</strong>
                      <div style="font-size: 9.5pt; color: #444; margin-top: 1px;">${p.description}</div>
                    </div>
                  `).join("");

                  const skillsHtml = result.skills_formatted.map(s =>
                    `<span style="display: inline-block; background: #f3f4f6; padding: 2px 10px; border-radius: 3px; font-size: 9pt; margin: 2px 4px 2px 0;">${s}</span>`
                  ).join("");

                  printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${result.name} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', 'Times New Roman', serif; max-width: 720px; margin: 0 auto; padding: 40px 32px; color: #1a1a1a; line-height: 1.45; }
  .name { font-size: 24pt; font-weight: bold; margin-bottom: 4px; }
  .contact { font-size: 9.5pt; color: #555; margin-bottom: 20px; }
  .section { margin-top: 20px; }
  .section-title { font-size: 10pt; text-transform: uppercase; letter-spacing: 2.5px; font-weight: bold; color: #333; border-bottom: 1.5px solid #ccc; padding-bottom: 4px; margin-bottom: 10px; }
  .summary { font-size: 10.5pt; color: #333; line-height: 1.55; }
  @media print {
    body { padding: 20px 24px; }
    @page { margin: 0.5in; }
  }
</style></head><body>
  <div class="name">${result.name}</div>
  ${contact ? `<div class="contact">${contact}</div>` : ""}
  ${result.summary ? `<div class="section"><div class="section-title">Summary</div><div class="summary">${result.summary}</div></div>` : ""}
  ${result.experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${expHtml}</div>` : ""}
  ${result.education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${eduHtml}</div>` : ""}
  ${result.projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projHtml}</div>` : ""}
  ${result.skills_formatted.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div>${skillsHtml}</div></div>` : ""}
</body></html>`);
                  printWindow.document.close();
                  printWindow.print();
                }}
              >
                Print / Save PDF
              </button>
            </div>

            <div ref={resumeRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10">
              {/* Name & Contact */}
              <h1 className="text-2xl font-bold tracking-tight">{result.name}</h1>
              <p className="text-xs text-gray-400 mt-1">
                {[result.email, result.phone, result.location].filter(Boolean).join(" | ")}
              </p>

              {/* Summary */}
              {result.summary && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">Summary</h2>
                  <p className="text-sm leading-relaxed text-gray-700">{result.summary}</p>
                </div>
              )}

              {/* Experience */}
              {result.experience.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">Experience</h2>
                  <div className="space-y-5">
                    {result.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-sm font-bold">{exp.title}</h3>
                          <span className="text-xs text-gray-400 shrink-0">{exp.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                        <ul className="mt-1.5 space-y-1 text-sm text-gray-700 list-disc pl-4">
                          {exp.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {result.education.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">Education</h2>
                  <div className="space-y-3">
                    {result.education.map((edu, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold">{edu.degree}</p>
                          <p className="text-xs text-gray-500">{edu.school}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {result.projects.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">Projects</h2>
                  <div className="space-y-3">
                    {result.projects.map((proj, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold">{proj.name}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {result.skills_formatted.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.skills_formatted.map((s) => (
                      <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                onClick={handleReset}
              >
                Build Another
              </button>
              <Link
                href="/analyze"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-indigo-700 transition"
              >
                Analyze This Resume
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
