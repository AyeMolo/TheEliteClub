"use client";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

const words = ["Decoded", "Analyzed", "Unlocked", "Elevated"];
const subtitle = "Know exactly where you stand — before you apply.";

const faqs = [
  { q: "Is it really free?", a: "100% free, no sign-up required. Just paste your resume and get instant results." },
  { q: "How accurate is the AI?", a: "We use Google's Gemini AI to analyze your resume against real industry standards. Results are directional — treat them as a strong starting point, not a guarantee." },
  { q: "What data do you store?", a: "Nothing. Your resume is sent to the AI for analysis and immediately discarded. We don't save, log, or share any of your data." },
  { q: "Can I use it for any industry?", a: "Yes. The AI adapts its analysis based on your field — tech, healthcare, finance, design, and more." },
];

export default function Landing() {
  const { user, isLoading: authLoading } = useUser();
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      if (i < subtitle.length) {
        setTypedText(subtitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const fadeRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.15 }
      );
    }
    observerRef.current.observe(node);
  }, []);

  return (
    <main className="bg-white text-gray-900 dot-grid overflow-hidden relative">
      {/* Floating blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-200 rounded-full opacity-20 blur-[120px]" />
        <div className="absolute top-[60%] -left-40 w-[400px] h-[400px] bg-indigo-300 rounded-full opacity-15 blur-[100px]" />
        <div className="absolute top-[30%] right-[-10%] w-[300px] h-[300px] bg-purple-200 rounded-full opacity-20 blur-[100px]" />
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100 rounded-full opacity-20 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 sm:px-16 py-6 max-w-6xl mx-auto">
        <span className="text-lg font-bold tracking-tight text-indigo-600">TheEliteClub</span>
        <div className="flex items-center gap-6">
          <Link href="/build" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition">
            Build Resume
          </Link>
          <Link href="/analyze" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition">
            Analyze Resume
          </Link>
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-3">
                {user.picture && (
                  <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <a href="/auth/logout" className="text-xs font-medium text-gray-400 hover:text-red-500 transition">
                  Logout
                </a>
              </div>
            ) : (
              <a href="/auth/login" className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Login
              </a>
            )
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
            Powered by Gemini AI
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Your Career,
            <br />
            <span
              key={words[wordIndex]}
              className="inline-block animate-[slideUp_0.4s_ease-out] text-indigo-600"
            >
              {words[wordIndex]}.
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-gray-500 max-w-lg mx-auto leading-relaxed h-8">
            {typedText}
            {showCursor && <span className="typing-cursor text-indigo-600">|</span>}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="bg-indigo-600 text-white px-10 py-4 text-base font-bold rounded-xl hover:bg-indigo-700 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200"
            >
              Analyze My Resume
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-400 hover:text-indigo-600 transition pb-0.5"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={fadeRef} className="fade-section relative z-10 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
            <p className="text-4xl font-black text-indigo-600">10+</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Key Metrics</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
            <p className="text-4xl font-black text-indigo-600">&lt;10s</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Analysis Time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
            <p className="text-4xl font-black text-indigo-600">8</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Industries</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
            <p className="text-4xl font-black text-indigo-600">4</p>
            <p className="text-sm font-medium text-gray-400 mt-1">AI Tools</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Three steps. That&apos;s it.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                <span className="text-2xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Paste</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Drop your resume text in. Optionally add a job posting you&apos;re targeting.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                <span className="text-2xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Analyze</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Get a resume score, salary estimate, skill gaps, strengths, and job match probability.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                <span className="text-2xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Level Up</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Generate cover letters, optimize LinkedIn, build a skill roadmap, and chat with your AI mentor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get — detailed analysis breakdown */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">What You Get</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">One paste. All of this.</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">&#9733;</div>
                <div>
                  <h4 className="font-semibold text-sm">Resume Score (0–100)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Animated gauge rating your clarity, impact, formatting, and relevance.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">$</div>
                <div>
                  <h4 className="font-semibold text-sm">Salary Estimate</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Market range based on your skills, experience level, and industry.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">&#9650;</div>
                <div>
                  <h4 className="font-semibold text-sm">Strengths &amp; Weaknesses</h4>
                  <p className="text-xs text-gray-400 mt-0.5">What&apos;s working on your resume and what needs fixing first.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">%</div>
                <div>
                  <h4 className="font-semibold text-sm">Interview &amp; Screening Probability</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Your realistic odds of getting the call, based on the job you&apos;re targeting.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">&#10003;</div>
                <div>
                  <h4 className="font-semibold text-sm">Job Match Score</h4>
                  <p className="text-xs text-gray-400 mt-0.5">See matching and missing skills side-by-side against any job posting.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">&#9998;</div>
                <div>
                  <h4 className="font-semibold text-sm">AI-Rewritten Summary</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Before/after comparison — see how AI would rewrite your professional summary.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Mock */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Live Preview</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">See it in action</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#4F46E5" strokeWidth="12" strokeLinecap="round" strokeDasharray="330 440" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">78</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-indigo-600">Good — room to grow</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Salary</p>
                <p className="text-lg font-bold">$85k–$110k</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Level</p>
                <p className="text-lg font-bold">Mid</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Match</p>
                <p className="text-lg font-bold">85%</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Interview</p>
                <p className="text-lg font-bold">72%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {["React", "TypeScript", "Node.js", "Python", "SQL"].map((s) => (
                <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
              ))}
            </div>

            {/* Before/After preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Before</p>
                <p className="text-xs text-gray-500 leading-relaxed">Experienced developer with skills in multiple programming languages looking for new opportunities...</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">After</p>
                <p className="text-xs text-gray-700 leading-relaxed">Full-stack engineer with 4+ years building scalable React and Node.js applications. Shipped features used by 50k+ users at a Series B startup.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">* Sample results — yours will be personalized</p>
        </div>
      </section>

      {/* AI Tools Showcase */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">AI-Powered Tools</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Go beyond the score</h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">After your analysis, unlock 4 tools that turn insights into action.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cover Letter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">&#9993;</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">Cover Letter Generator</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Paste a job description and get a tailored, professional cover letter in seconds. References your actual skills and experience.
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 italic leading-relaxed">&quot;Dear Hiring Manager, As a full-stack engineer with deep experience in React and Node.js, I was excited to see your opening for...&quot;</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">in</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">LinkedIn Optimizer</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Get an optimized headline and About section generated from your resume. Copy-paste ready.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Full-Stack Engineer | React &amp; Node.js | Building Products Users Love</p>
                <p className="text-xs text-gray-400 italic">I build scalable web apps that solve real problems...</p>
              </div>
            </div>

            {/* Skill Roadmap */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">&#127919;</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">Skill Roadmap</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                A prioritized list of skills to learn next, with time estimates and reasons. Know exactly what to study.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">high</span>
                  <span className="text-xs font-medium text-gray-700">System Design</span>
                  <span className="text-xs text-gray-400 ml-auto">4-6 weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">med</span>
                  <span className="text-xs font-medium text-gray-700">Docker &amp; CI/CD</span>
                  <span className="text-xs text-gray-400 ml-auto">2-3 weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">low</span>
                  <span className="text-xs font-medium text-gray-700">GraphQL</span>
                  <span className="text-xs text-gray-400 ml-auto">1-2 weeks</span>
                </div>
              </div>
            </div>

            {/* Industry Benchmark */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">&#128200;</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">Industry Benchmark</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Pick any industry and see how your resume stacks up — fit score, in-demand skills, and salary range.
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold">Technology</span>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">82% fit</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "82%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Who It&apos;s For</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Built for anyone with a resume</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300">
              <p className="text-4xl mb-4">&#127891;</p>
              <h3 className="font-bold text-base mb-2">Students</h3>
              <p className="text-sm text-gray-500 leading-relaxed">First resume? Get a score, know what&apos;s missing, and build a roadmap before you start applying.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300">
              <p className="text-4xl mb-4">&#128640;</p>
              <h3 className="font-bold text-base mb-2">Career Switchers</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Benchmark yourself against a new industry. See which skills transfer and which ones you need.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-300">
              <p className="text-4xl mb-4">&#128188;</p>
              <h3 className="font-bold text-base mb-2">Job Seekers</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Match against specific job postings, generate cover letters, and optimize your LinkedIn — all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Results</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">People are using it</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-indigo-500">
                <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&quot;Went from a 48 to a 79 resume score after following the skill roadmap. Got 3 screening calls in a week.&quot;</p>
              <div>
                <p className="text-sm font-bold">Sarah K.</p>
                <p className="text-xs text-gray-400">CS Student, UVA</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-indigo-500">
                <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&quot;The cover letter generator saved me hours. I just pasted the job posting and had a tailored letter in 10 seconds.&quot;</p>
              <div>
                <p className="text-sm font-bold">Marcus T.</p>
                <p className="text-xs text-gray-400">Marketing Manager</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-indigo-500">
                <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&quot;I&apos;m switching from healthcare to tech. The industry benchmark showed me exactly what skills I was missing.&quot;</p>
              <div>
                <p className="text-sm font-bold">Priya M.</p>
                <p className="text-xs text-gray-400">Career Switcher</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Questions?</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:border-indigo-200">
                <button
                  className="w-full text-left px-8 py-6 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-base">{faq.q}</span>
                  <span
                    className="text-indigo-600 text-xl font-bold shrink-0 transition-transform duration-300"
                    style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "200px" : "0px" }}
                >
                  <p className="px-8 pb-6 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={fadeRef} className="fade-section relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">Ready?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
            Stop guessing. Get instant, AI-powered feedback on your resume and career path.
          </p>
          <Link
            href="/analyze"
            className="inline-block bg-indigo-600 text-white px-12 py-5 text-lg font-bold rounded-xl hover:bg-indigo-700 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 py-8 px-8 sm:px-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-400">Built for HooHacks 2026</span>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <span>Gemini AI</span>
            <span>Next.js</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
