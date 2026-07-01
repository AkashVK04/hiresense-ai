import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { extractTextFromPDF } from "../utils/pdfReader";
import { analyzeResume } from "../services/groqService";

function UploadResume() {
  const [resume, setResume] = useState(null);
  const [role, setRole] = useState("Frontend");
  const [difficulty, setDifficulty] = useState("Easy");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleStart = async () => {
    if (!resume) {
      alert("Please upload your resume PDF");
      return;
    }

    setLoading(true);

    try {
      const resumeText = await extractTextFromPDF(resume);

      localStorage.setItem("resumeText", resumeText);
      localStorage.setItem("role", role);
      localStorage.setItem("difficulty", difficulty);

      const analysis = await analyzeResume(resumeText, role);
      localStorage.setItem("resumeAnalysis", JSON.stringify(analysis));

      localStorage.removeItem("interviewQuestions");
      localStorage.removeItem("interviewResults");
      sessionStorage.removeItem("reportSaved");
      navigate("/interview");
    } catch (error) {
      console.error("Resume Error:", error);
      alert(error.message || "Failed to read or analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2"
          >
            <Sparkles className="text-cyan-300" />
            <h1 className="text-2xl font-bold">HireSense AI</h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold backdrop-blur-xl hover:bg-white/20 transition"
          >
            Home
          </button>
        </nav>

        <section className="grid lg:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-5 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Step 1: Resume Intelligence
            </p>

            <h2 className="text-5xl font-black leading-tight">
              Upload your resume and let{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                AI prepare your interview
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              HireSense AI reads your resume, detects skills and projects,
              analyzes gaps, and generates role-specific interview questions.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                ["PDF Parsing", "Extract resume text"],
                ["ATS Analysis", "Score your resume"],
                ["Smart Interview", "Generate questions"],
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <h3 className="font-bold">{item[0]}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item[1]}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-2xl"
          >
            <div className="rounded-2xl bg-slate-950/70 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
                  <Upload />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Interview Setup</h2>
                  <p className="text-sm text-slate-400">
                    Upload resume and choose role
                  </p>
                </div>
              </div>

              <label className="block">
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-cyan-400/30 bg-cyan-400/5 px-6 py-10 text-center hover:bg-cyan-400/10 transition">
                  <FileText className="mb-4 text-cyan-300" size={42} />
                  <p className="font-semibold">
                    {resume ? resume.name : "Click to upload resume PDF"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Only PDF resumes are supported
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                </div>
              </label>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Briefcase size={18} />
                    Target Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none backdrop-blur-xl"
                  >
                    <option className="text-black">Frontend</option>
                    <option className="text-black">Java</option>
                    <option className="text-black">Full Stack</option>
                    <option className="text-black">Data Analyst</option>
                    <option className="text-black">AI/ML</option>
                    <option className="text-black">System Design</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <SlidersHorizontal size={18} />
                    Difficulty Level
                  </label>

                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none backdrop-blur-xl"
                  >
                    <option className="text-black">Easy</option>
                    <option className="text-black">Medium</option>
                    <option className="text-black">Hard</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-4 text-lg font-bold shadow-xl hover:scale-[1.02] transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                Your resume is processed locally for text extraction and sent
                securely to the backend for AI analysis.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default UploadResume;