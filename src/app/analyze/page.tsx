"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface AnalysisResult {
  resume_score: number;
  soc_code?: string;
  soc_title?: string;
  salary_estimate: string;
  experience_level: string;
  top_skills: string[];
  recommendation: string;
  strengths: string[];
  improvements: string[];
  rewritten_summary?: string;
  screening_call_probability?: number;
  interview_probability?: number;
  job_match_score?: number;
  matching_skills?: string[];
  missing_skills?: string[];
  job_fit_summary?: string;
}

interface BlsSalary {
  soc_code: string;
  salaries: Record<string, string>;
  source: string;
}

interface LinkedInResult {
  headline: string;
  summary: string;
}

interface SkillRoadmapResult {
  current_level: string;
  target_level: string;
  skills: { name: string; priority: string; reason: string; time_estimate: string }[];
}

interface BenchmarkResult {
  industry: string;
  fit_score: number;
  verdict: string;
  strengths_for_industry: string[];
  gaps_for_industry: string[];
  in_demand_skills: string[];
  salary_range_industry: string;
  recommendation: string;
}

const chatSuggestions = [
  "How do I level up?",
  "Rewrite my summary",
  "What skills am I missing?",
  "Interview tips for my level",
];

const industries = ["Technology", "Finance", "Healthcare", "Marketing", "Design", "Data Science", "Education", "Consulting"];

function progressColor(value: number) {
  if (value >= 70) return "#16a34a";
  if (value >= 40) return "#ca8a04";
  return "#dc2626";
}

function priorityColor(p: string) {
  if (p === "high") return "bg-red-50 text-red-600 border-red-200";
  if (p === "medium") return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-green-50 text-green-600 border-green-200";
}

export default function Analyze() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Feature states
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [linkedin, setLinkedin] = useState<LinkedInResult | null>(null);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [skillRoadmap, setSkillRoadmap] = useState<SkillRoadmapResult | null>(null);
  const [skillRoadmapLoading, setSkillRoadmapLoading] = useState(false);
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [blsSalary, setBlsSalary] = useState<BlsSalary | null>(null);
  const [blsLoading, setBlsLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-fetch BLS salary data when analysis result comes in
  useEffect(() => {
    if (result?.soc_code) {
      setBlsLoading(true);
      fetch("/api/bls-salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socCode: result.soc_code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result) setBlsSalary(data.result);
        })
        .catch(() => {})
        .finally(() => setBlsLoading(false));
    }
  }, [result]);

  async function handleChatSend() {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, resume, analysis: result }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatMessages((prev) => [...prev, { role: "bot", text: data.error || "Something went wrong" }]);
        return;
      }
      setChatMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Failed to get a response" }]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleReset() {
    setResume("");
    setJobDescription("");
    setResult(null);
    setError(null);
    setLoading(false);
    setChatMessages([]);
    setChatInput("");
    setCoverLetter(null);
    setLinkedin(null);
    setSkillRoadmap(null);
    setBenchmark(null);
    setSelectedIndustry("");
    setBlsSalary(null);
  }

  async function handleAnalyze() {
    if (!resume.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          ...(jobDescription.trim() && { jobDescription }),
        }),
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

  async function handleCoverLetter() {
    if (!jobDescription.trim()) return;
    setCoverLetterLoading(true);
    setCoverLetter(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await res.json();
      if (res.ok) setCoverLetter(data.result);
      else setCoverLetter("Error: " + (data.error || "Failed to generate cover letter"));
    } catch {
      setCoverLetter("Error: Failed to connect to the server");
    } finally {
      setCoverLetterLoading(false);
    }
  }

  async function handleLinkedin() {
    setLinkedinLoading(true);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const data = await res.json();
      if (res.ok) setLinkedin(data.result);
    } catch { /* ignore */ }
    finally { setLinkedinLoading(false); }
  }

  async function handleSkillRoadmap() {
    setSkillRoadmapLoading(true);
    try {
      const res = await fetch("/api/skill-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, analysis: result }),
      });
      const data = await res.json();
      if (res.ok) setSkillRoadmap(data.result);
    } catch { /* ignore */ }
    finally { setSkillRoadmapLoading(false); }
  }

  async function handleBenchmark() {
    if (!selectedIndustry) return;
    setBenchmarkLoading(true);
    try {
      const res = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, industry: selectedIndustry }),
      });
      const data = await res.json();
      if (res.ok) setBenchmark(data.result);
    } catch { /* ignore */ }
    finally { setBenchmarkLoading(false); }
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

        {/* Input Form */}
        {!result && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-1">Analyze Your Resume</h2>
            <p className="text-sm text-gray-400 mb-6">Paste your resume below to get started.</p>

            <div className="relative mb-5">
              <textarea
                className="w-full h-48 rounded-xl border border-gray-200 bg-gray-50 p-4 pb-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-gray-300 transition resize-none"
                placeholder="Paste resume here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">{resume.length} chars</span>
            </div>

            <div className="relative mb-6">
              <textarea
                className="w-full h-32 rounded-xl border border-gray-200 bg-gray-50 p-4 pb-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-gray-300 transition resize-none"
                placeholder="Paste job description here (optional) — get a match score and gap analysis"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">{jobDescription.length} chars</span>
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleAnalyze}
              disabled={loading || !resume.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Resume Score Gauge */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-4 flex flex-col items-center">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Resume Score</h2>
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke={progressColor(result.resume_score)}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.resume_score / 100) * 440} 440`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{result.resume_score}</span>
                  <span className="text-xs text-gray-400 font-medium">/ 100</span>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: progressColor(result.resume_score) }}>
                {result.resume_score >= 80 ? "Excellent" : result.resume_score >= 60 ? "Good — room to grow" : result.resume_score >= 40 ? "Needs work" : "Major improvements needed"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs uppercase tracking-widest text-gray-400">Salary Data</h2>
                  {blsSalary && (
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">BLS Verified</span>
                  )}
                </div>

                {/* AI estimate */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">AI Estimate</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.salary_estimate}</p>
                </div>

                {/* BLS real data */}
                {blsLoading && (
                  <p className="text-xs text-gray-400 italic">Loading BLS data...</p>
                )}
                {blsSalary && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      U.S. Bureau of Labor Statistics — {result.soc_title || blsSalary.soc_code}
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "10th", key: "p10" },
                        { label: "25th", key: "p25" },
                        { label: "Median", key: "median" },
                        { label: "75th", key: "p75" },
                        { label: "90th", key: "p90" },
                      ].map(({ label, key }) => (
                        <div key={key} className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase">{label}</p>
                          <p className="text-sm font-bold">
                            {blsSalary.salaries[key]
                              ? `$${Number(blsSalary.salaries[key]).toLocaleString()}`
                              : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                      {blsSalary.salaries.p10 && blsSalary.salaries.p90 && (
                        <div
                          className="absolute h-full bg-indigo-200 rounded-full"
                          style={{
                            left: "10%",
                            right: "10%",
                          }}
                        />
                      )}
                      {blsSalary.salaries.median && (
                        <div
                          className="absolute h-full w-1 bg-indigo-600 rounded-full"
                          style={{ left: "50%" }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-2">{blsSalary.source}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Experience Level</h2>
                <p className="text-2xl font-bold capitalize">{result.experience_level}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Occupation</h2>
                <p className="text-lg font-bold">{result.soc_title || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">SOC {result.soc_code || "—"}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Top Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {result.top_skills.map((skill) => (
                    <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Strengths</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Areas to Improve</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.improvements.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-amber-500 mt-0.5">&#9679;</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Recommendation</h2>
                <p className="text-sm leading-relaxed text-gray-700">{result.recommendation}</p>
              </div>

              {/* Before / After Rewrite */}
              {result.rewritten_summary && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                  <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">AI-Rewritten Summary</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Before</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resume.length > 300 ? resume.slice(0, 300) + "..." : resume}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">After</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{result.rewritten_summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Match Section */}
              {result.job_match_score != null && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Screening Call</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold">{result.screening_call_probability ?? 0}%</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${result.screening_call_probability ?? 0}%`,
                            backgroundColor: progressColor(result.screening_call_probability ?? 0),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Interview</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold">{result.interview_probability ?? 0}%</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${result.interview_probability ?? 0}%`,
                            backgroundColor: progressColor(result.interview_probability ?? 0),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Job Match Score</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold">{result.job_match_score}%</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${result.job_match_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Matching Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.matching_skills?.map((s) => (
                        <span key={s} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Missing Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills?.map((s) => (
                        <span key={s} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-2">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Job Fit Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-700">{result.job_fit_summary}</p>
                  </div>
                </>
              )}
            </div>

            {/* ===== TOOLS SECTION ===== */}
            <div className="mt-10">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Tools</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-200 disabled:opacity-40"
                  onClick={handleCoverLetter}
                  disabled={coverLetterLoading || !jobDescription.trim()}
                >
                  <p className="text-2xl mb-1">&#9993;</p>
                  <p className="text-xs font-semibold">{coverLetterLoading ? "Writing..." : "Cover Letter"}</p>
                  {!jobDescription.trim() && (
                    <p className="text-[10px] text-gray-400 mt-1">Needs job description</p>
                  )}
                </button>
                <button
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-200 disabled:opacity-40"
                  onClick={handleLinkedin}
                  disabled={linkedinLoading}
                >
                  <p className="text-2xl mb-1">in</p>
                  <p className="text-xs font-semibold">{linkedinLoading ? "Generating..." : "LinkedIn Copy"}</p>
                </button>
                <button
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-200 disabled:opacity-40"
                  onClick={handleSkillRoadmap}
                  disabled={skillRoadmapLoading}
                >
                  <p className="text-2xl mb-1">&#127919;</p>
                  <p className="text-xs font-semibold">{skillRoadmapLoading ? "Building..." : "Skill Roadmap"}</p>
                </button>
                <button
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-200 disabled:opacity-40"
                  onClick={() => {
                    if (!selectedIndustry) {
                      const el = document.getElementById("industry-select");
                      el?.focus();
                      return;
                    }
                    handleBenchmark();
                  }}
                  disabled={benchmarkLoading}
                >
                  <p className="text-2xl mb-1">&#128200;</p>
                  <p className="text-xs font-semibold">{benchmarkLoading ? "Analyzing..." : "Benchmark"}</p>
                </button>
              </div>

              {/* Industry selector for benchmark */}
              <div className="mt-3">
                <select
                  id="industry-select"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">Select an industry for benchmarking...</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Letter Result */}
            {coverLetter && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-widest text-gray-400">Generated Cover Letter</h2>
                  <button
                    className="text-xs text-indigo-600 font-medium hover:underline"
                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{coverLetter}</p>
              </div>
            )}

            {/* LinkedIn Result */}
            {linkedin && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">LinkedIn Copy</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Headline</p>
                      <button
                        className="text-xs text-indigo-600 font-medium hover:underline"
                        onClick={() => navigator.clipboard.writeText(linkedin.headline)}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-base font-semibold text-gray-800">{linkedin.headline}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">About</p>
                      <button
                        className="text-xs text-indigo-600 font-medium hover:underline"
                        onClick={() => navigator.clipboard.writeText(linkedin.summary)}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{linkedin.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Roadmap Result */}
            {skillRoadmap && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Skill Roadmap</h2>
                <p className="text-sm text-gray-500 mb-5">
                  <span className="font-medium text-gray-700 capitalize">{skillRoadmap.current_level}</span>
                  {" → "}
                  <span className="font-medium text-indigo-600 capitalize">{skillRoadmap.target_level}</span>
                </p>
                <div className="space-y-3">
                  {skillRoadmap.skills.map((skill, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <span className={`shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded border ${priorityColor(skill.priority)}`}>
                        {skill.priority}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{skill.reason}</p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400 font-medium">{skill.time_estimate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benchmark Result */}
            {benchmark && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-widest text-gray-400">Industry Benchmark</h2>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{benchmark.industry}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{benchmark.fit_score}%</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${benchmark.fit_score}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{benchmark.verdict}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Strengths</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {benchmark.strengths_for_industry.map((s) => (
                        <li key={s} className="flex gap-2"><span className="text-green-500">&#10003;</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Gaps</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {benchmark.gaps_for_industry.map((s) => (
                        <li key={s} className="flex gap-2"><span className="text-red-400">&#9679;</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">In-Demand Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {benchmark.in_demand_skills.map((s) => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Industry Salary Range</span>
                  <span className="text-base font-bold">{benchmark.salary_range_industry}</span>
                </div>

                <p className="text-sm leading-relaxed text-gray-700">{benchmark.recommendation}</p>
              </div>
            )}

            <button
              className="mt-6 w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              onClick={handleReset}
            >
              Analyze Another Resume
            </button>

            {/* Chatbot */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Career Advisor</h2>
                <p className="text-sm text-gray-400 mt-0.5">Ask anything — how to level up, interview tips, what to learn next.</p>
              </div>

              <div className="max-h-80 overflow-y-auto p-6 flex flex-col gap-3">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-300 mb-4">Ask a question to get started</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {chatSuggestions.map((s) => (
                        <button
                          key={s}
                          className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200"
                          onClick={() => { setChatInput(s); }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap rounded-2xl ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white self-end rounded-br-md"
                        : "bg-gray-100 text-gray-800 self-start rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {chatLoading && (
                  <div className="px-4 py-3 text-sm bg-gray-100 text-gray-400 italic self-start rounded-2xl rounded-bl-md">
                    Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:opacity-50"
                  type="text"
                  placeholder="e.g. How do I go from junior to senior?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleChatSend(); }}
                  disabled={chatLoading}
                />
                <button
                  className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
