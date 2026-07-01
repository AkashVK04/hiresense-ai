import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { analyzePerformance } from "../services/groqService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Sparkles,
  Download,
  Trophy,
  Brain,
  MessageSquare,
  ShieldCheck,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
} from "lucide-react";

function Results() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const storedResults = localStorage.getItem("interviewResults");
  const results = storedResults ? JSON.parse(storedResults) : [];

  const storedAnalysis = localStorage.getItem("resumeAnalysis");
  const resumeAnalysis = storedAnalysis ? JSON.parse(storedAnalysis) : null;

  const role = localStorage.getItem("role") || "Frontend";
  const difficulty = localStorage.getItem("difficulty") || "Easy";

  const toText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(toText).join(", ");
    if (typeof value === "object") {
      return (
        value.name ||
        value.title ||
        value.skill ||
        value.description ||
        JSON.stringify(value)
      );
    }
    return String(value);
  };

  const getScore = (item, key) => {
    return Number(item.evaluation?.[key] ?? item[key] ?? 0);
  };

  const getField = (item, key) => {
    return item.evaluation?.[key] ?? item[key] ?? "";
  };

  const avg = (key) => {
    if (results.length === 0) return 0;

    const total = results.reduce((sum, item) => {
      return sum + getScore(item, key);
    }, 0);

    return Math.round((total / results.length) * 10);
  };

  const overallAverage = avg("overallScore");
  const technicalAverage = avg("technicalScore");
  const communicationAverage = avg("communicationScore");
  const confidenceAverage = avg("confidenceScore");

  const chartData = results.map((item, index) => ({
    question: `Q${index + 1}`,
    Overall: getScore(item, "overallScore"),
    Technical: getScore(item, "technicalScore"),
    Communication: getScore(item, "communicationScore"),
    Confidence: getScore(item, "confidenceScore"),
  }));

  const getRecommendation = () => {
    if (overallAverage >= 85) return "Strong Hire";
    if (overallAverage >= 70) return "Hire";
    if (overallAverage >= 50) return "Needs Improvement";
    return "Not Ready Yet";
  };

  const saveReportToFirestore = async () => {
    try {
      if (!currentUser) return;
      if (results.length === 0) return;

      const alreadySaved = sessionStorage.getItem("reportSaved");
      if (alreadySaved) return;

      await addDoc(collection(db, "interviewReports"), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,

        role,
        difficulty,

        overallScore: overallAverage,
        technicalScore: technicalAverage,
        communicationScore: communicationAverage,
        confidenceScore: confidenceAverage,

        recommendation: getRecommendation(),

        results,
        resumeAnalysis,
        performanceAnalysis,

        createdAt: serverTimestamp(),
      });

      sessionStorage.setItem("reportSaved", "true");
      console.log("Report saved successfully");
    } catch (error) {
      console.error("Firestore Save Error:", error);
    }
  };

  useEffect(() => {
    if (currentUser && results.length > 0) {
      saveReportToFirestore();
    }
  }, [currentUser, results.length]);

  useEffect(() => {
    async function loadPerformanceAnalysis() {
      try {
        const saved = localStorage.getItem("performanceAnalysis");

        if (saved) {
          setPerformanceAnalysis(JSON.parse(saved));
          return;
        }

        if (results.length === 0) return;

        setAnalysisLoading(true);

        const analysis = await analyzePerformance(results, role);

        setPerformanceAnalysis(analysis);
        localStorage.setItem("performanceAnalysis", JSON.stringify(analysis));
      } catch (error) {
        console.error("Performance Analysis Error:", error);
      } finally {
        setAnalysisLoading(false);
      }
    }

    loadPerformanceAnalysis();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("HireSense AI Advanced Interview Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Role: ${role}`, 20, 35);
    doc.text(`Difficulty: ${difficulty}`, 20, 45);
    doc.text(`Overall Score: ${overallAverage}/100`, 20, 55);
    doc.text(`Technical Score: ${technicalAverage}/100`, 20, 65);
    doc.text(`Communication Score: ${communicationAverage}/100`, 20, 75);
    doc.text(`Confidence Score: ${confidenceAverage}/100`, 20, 85);
    doc.text(`Recommendation: ${getRecommendation()}`, 20, 95);

    let y = 115;

    if (resumeAnalysis) {
      doc.text(`Resume Score: ${resumeAnalysis.resumeScore || 0}/100`, 20, y);
      y += 10;

      doc.text(
        doc.splitTextToSize(
          `Resume Summary: ${toText(resumeAnalysis.summary)}`,
          170
        ),
        20,
        y
      );
      y += 25;
    }

    if (performanceAnalysis) {
      doc.text(
        doc.splitTextToSize(
          `Strengths: ${toText(performanceAnalysis.strengths)}`,
          170
        ),
        20,
        y
      );
      y += 20;

      doc.text(
        doc.splitTextToSize(
          `Weaknesses: ${toText(performanceAnalysis.weaknesses)}`,
          170
        ),
        20,
        y
      );
      y += 20;

      doc.text(
        doc.splitTextToSize(
          `Final Advice: ${toText(performanceAnalysis.finalAdvice)}`,
          170
        ),
        20,
        y
      );
      y += 25;
    }

    results.forEach((item, index) => {
      if (y > 245) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        doc.splitTextToSize(`Q${index + 1}: ${toText(item.question)}`, 170),
        20,
        y
      );
      y += 15;

      doc.text(`Overall: ${getScore(item, "overallScore")}/10`, 20, y);
      y += 8;
      doc.text(`Technical: ${getScore(item, "technicalScore")}/10`, 20, y);
      y += 8;
      doc.text(
        `Communication: ${getScore(item, "communicationScore")}/10`,
        20,
        y
      );
      y += 8;
      doc.text(`Confidence: ${getScore(item, "confidenceScore")}/10`, 20, y);
      y += 12;

      doc.text(
        doc.splitTextToSize(
          `Feedback: ${toText(getField(item, "feedback"))}`,
          170
        ),
        20,
        y
      );
      y += 20;
    });

    doc.save("HireSense_AI_Advanced_Report.pdf");
  };

  const scoreCards = [
    {
      title: "Overall",
      value: overallAverage,
      icon: <Trophy />,
    },
    {
      title: "Technical",
      value: technicalAverage,
      icon: <Brain />,
    },
    {
      title: "Communication",
      value: communicationAverage,
      icon: <MessageSquare />,
    },
    {
      title: "Confidence",
      value: confidenceAverage,
      icon: <ShieldCheck />,
    },
  ];
    if (results.length === 0) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-3xl border border-white/10 bg-white/10 p-10 text-center backdrop-blur-2xl shadow-2xl"
        >
          <Sparkles className="mx-auto mb-4 text-cyan-300" size={42} />
          <h2 className="text-3xl font-black">No Results Found</h2>
          <p className="mt-3 text-slate-300">Please complete the interview first.</p>

          <button
            onClick={() => navigate("/upload")}
            className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-bold shadow-xl hover:scale-105 transition"
          >
            Start Interview
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-300" />
            <h1 className="text-2xl font-bold">HireSense AI</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold backdrop-blur-xl hover:bg-white/20 transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold backdrop-blur-xl hover:bg-white/20 transition"
            >
              Home
            </button>
          </div>
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-10"
        >
          <p className="mb-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            Final Interview Report
          </p>

          <h2 className="text-5xl font-black">
            Your AI Interview{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Performance Dashboard
            </span>
          </h2>

          <p className="mt-4 text-slate-300">
            Role: {role} • Difficulty: {difficulty} • Questions Answered: {results.length}
          </p>
        </motion.section>

        <section className="grid md:grid-cols-4 gap-5">
          {scoreCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
                {card.icon}
              </div>

              <p className="text-slate-400">{card.title} Score</p>
              <h3 className="mt-2 text-4xl font-black">{card.value}/100</h3>
            </motion.div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h2 className="text-2xl font-bold">Hiring Recommendation</h2>
              <p className="mt-2 text-slate-300">
                Based on overall score, communication, confidence, and technical performance.
              </p>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-400/10 px-6 py-4">
              <p className="text-2xl font-black text-green-300">
                {getRecommendation()}
              </p>
            </div>
          </div>
        </section>

        {resumeAnalysis && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
                <FileText />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Resume Analysis</h2>
                <p className="text-sm text-slate-400">
                  ATS-style resume insights for {role}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
                <p className="text-slate-300">Resume Score</p>
                <h3 className="mt-2 text-5xl font-black text-cyan-300">
                  {resumeAnalysis.resumeScore || 0}/100
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {toText(resumeAnalysis.summary)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <CheckCircle className="text-green-300" />
                  Skills Detected
                </h3>

                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.skillsDetected?.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-400/10 px-3 py-1 text-sm text-green-300"
                    >
                      {toText(skill)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <AlertTriangle className="text-yellow-300" />
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.missingSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300"
                    >
                      {toText(skill)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid lg:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <h3 className="mb-4 font-bold">Projects Detected</h3>

                <ul className="space-y-2 text-slate-300">
                  {resumeAnalysis.projectsDetected?.map((project, index) => (
                    <li key={index}>• {toText(project)}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Lightbulb className="text-cyan-300" />
                  Suggestions
                </h3>

                <ul className="space-y-2 text-slate-300">
                  {resumeAnalysis.suggestions?.map((suggestion, index) => (
                    <li key={index}>• {toText(suggestion)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl">
          <h2 className="mb-6 text-2xl font-bold">Performance Analytics</h2>

          <div className="h-[420px] rounded-3xl bg-slate-950/70 p-6">
            {results.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Overall" />
                  <Bar dataKey="Technical" />
                  <Bar dataKey="Communication" />
                  <Bar dataKey="Confidence" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No chart data available.</p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl">
          <h2 className="mb-6 text-2xl font-bold">
            AI Strengths & Weaknesses Analysis
          </h2>

          {analysisLoading && (
            <p className="text-cyan-300">Analyzing your interview performance...</p>
          )}

          {performanceAnalysis && (
            <>
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="rounded-3xl border border-green-400/20 bg-green-400/10 p-6">
                  <h3 className="mb-4 text-xl font-bold text-green-300">
                    Strengths
                  </h3>

                  <ul className="space-y-2 text-slate-300">
                    {performanceAnalysis.strengths?.map((item, index) => (
                      <li key={index}>✓ {toText(item)}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
                  <h3 className="mb-4 text-xl font-bold text-yellow-300">
                    Weaknesses
                  </h3>

                  <ul className="space-y-2 text-slate-300">
                    {performanceAnalysis.weaknesses?.map((item, index) => (
                      <li key={index}>⚠ {toText(item)}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
                  <h3 className="mb-4 text-xl font-bold text-cyan-300">
                    Focus Areas
                  </h3>

                  <ul className="space-y-2 text-slate-300">
                    {performanceAnalysis.focusAreas?.map((item, index) => (
                      <li key={index}>• {toText(item)}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                <h3 className="mb-3 text-xl font-bold">Final Advice</h3>
                <p className="text-slate-300">
                  {toText(performanceAnalysis.finalAdvice)}
                </p>
              </div>
            </>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-bold shadow-xl hover:scale-105 transition"
          >
            <Download size={18} />
            Download PDF Report
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-bold backdrop-blur-xl hover:bg-white/20 transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-bold backdrop-blur-xl hover:bg-white/20 transition"
          >
            <RotateCcw size={18} />
            Start New Interview
          </button>
        </div>

        <section className="mt-10 pb-16">
          <h2 className="mb-6 text-2xl font-bold">Question-wise Breakdown</h2>

          <div className="space-y-5">
            {results.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl"
              >
                <h3 className="text-xl font-bold">
                  Q{index + 1}. {toText(item.question)}
                </h3>

                <p className="mt-4 text-slate-300">
                  <b className="text-white">Your Answer:</b> {toText(item.answer)}
                </p>

                <div className="mt-5 grid md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-slate-400">Overall</p>
                    <h4 className="text-2xl font-black">
                      {getScore(item, "overallScore")}/10
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-slate-400">Technical</p>
                    <h4 className="text-2xl font-black">
                      {getScore(item, "technicalScore")}/10
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-slate-400">Communication</p>
                    <h4 className="text-2xl font-black">
                      {getScore(item, "communicationScore")}/10
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-slate-400">Confidence</p>
                    <h4 className="text-2xl font-black">
                      {getScore(item, "confidenceScore")}/10
                    </h4>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-slate-300">
                  <p>
                    <b className="text-white">Feedback:</b>{" "}
                    {toText(getField(item, "feedback"))}
                  </p>
                  <p>
                    <b className="text-white">Ideal Answer:</b>{" "}
                    {toText(getField(item, "idealAnswer"))}
                  </p>
                  <p>
                    <b className="text-white">Improvement:</b>{" "}
                    {toText(getField(item, "improvement"))}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Results;