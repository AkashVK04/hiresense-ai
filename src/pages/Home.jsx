import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, FileText, BarChart3, Mic, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle, logout } = useAuth();

  const features = [
    {
      icon: <FileText size={30} />,
      title: "Resume Intelligence",
      desc: "Extracts resume data, detects skills, projects, missing skills, and gives ATS-style insights.",
    },
    {
      icon: <Brain size={30} />,
      title: "AI Interview Engine",
      desc: "Generates role-based technical, project, and HR questions using AI.",
    },
    {
      icon: <BarChart3 size={30} />,
      title: "Performance Analytics",
      desc: "Shows technical, communication, confidence, and overall scores with visual charts.",
    },
    {
      icon: <Mic size={30} />,
      title: "Voice Ready",
      desc: "Supports voice recording and can be upgraded to AI speech-to-text transcription.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />

      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <nav className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-300" />
            <h1 className="text-2xl font-bold">HireSense AI</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser ? (
              <>
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt="User"
                    className="h-9 w-9 rounded-full border border-white/20"
                  />
                )}

                <span className="max-w-[160px] truncate text-sm text-slate-300">
                  {currentUser.displayName}
                </span>

                <button
                  onClick={logout}
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold backdrop-blur-xl hover:bg-white/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold backdrop-blur-xl hover:bg-white/20 transition"
              >
                Sign in with Google
              </button>
            )}

            <button
              onClick={() => navigate("/upload")}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 font-semibold shadow-lg hover:scale-105 transition"
            >
              Start Interview
            </button>
          </div>
        </nav>

        <section className="grid lg:grid-cols-2 gap-12 items-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-5 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              AI-Powered Resume-Based Interview Platform
            </p>

            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              Crack Interviews with{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                AI Feedback
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Upload your resume, choose your target role, answer AI-generated
              questions, and receive scoring, ideal answers, resume analysis,
              analytics, and a downloadable interview report.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/upload")}
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-lg font-bold shadow-xl hover:scale-105 transition"
              >
                Start Mock Interview
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold backdrop-blur-xl hover:bg-white/20 transition"
              >
                View Features
              </button>
            </div>

            {currentUser && (
              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-green-200">
                Logged in as {currentUser.email}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-2xl"
          >
            <div className="rounded-2xl bg-slate-950/70 p-6">
              <p className="text-sm text-cyan-300">Live Interview Score</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["Technical", "86%"],
                  ["Communication", "78%"],
                  ["Confidence", "82%"],
                  ["Overall", "84%"],
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/10 p-5"
                  >
                    <p className="text-slate-400">{item[0]}</p>
                    <h3 className="mt-2 text-3xl font-black">{item[1]}</h3>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
                <p className="text-green-300 font-semibold">
                  Recommendation: Strong Hire
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Candidate shows strong frontend fundamentals and project
                  explanation skills.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section
          id="features"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Home;