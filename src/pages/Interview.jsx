import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Send,
  ArrowRight,
  Loader2,
  Brain,
  MessageSquare,
  Trophy,
} from "lucide-react";

import { generateQuestions, evaluateAnswer } from "../services/groqService";

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "Frontend";
  const difficulty = localStorage.getItem("difficulty") || "Easy";
  const resumeText = localStorage.getItem("resumeText") || "";

  const fallbackQuestions = [
    "Explain your strongest project from your resume.",
    "What technologies have you used in your recent projects?",
    "Describe one technical challenge you faced and how you solved it.",
    "How would you improve one of your projects?",
    "Why are you interested in this role?",
    "What are your strengths as a developer?",
    "Describe your experience with databases or backend services.",
    "Tell me about yourself.",
  ];

  const toText = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    return JSON.stringify(value);
  };

  useEffect(() => {
    async function loadQuestions() {
      try {
        const savedQuestions = localStorage.getItem("interviewQuestions");

        if (savedQuestions) {
          setQuestions(JSON.parse(savedQuestions));
          setLoading(false);
          return;
        }

        const data = await generateQuestions(resumeText, role, difficulty);

        setQuestions(data);
        localStorage.setItem("interviewQuestions", JSON.stringify(data));
      } catch (err) {
        console.error(err);
        setQuestions(fallbackQuestions);
        localStorage.setItem(
          "interviewQuestions",
          JSON.stringify(fallbackQuestions)
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [resumeText, role, difficulty]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please type your answer");
      return;
    }

    setEvaluating(true);

    try {
      const result = await evaluateAnswer(
        questions[currentIndex],
        answer,
        role
      );

      const normalizedResult = {
        technicalScore: Number(result.technicalScore || 0),
        communicationScore: Number(result.communicationScore || 0),
        confidenceScore: Number(result.confidenceScore || 0),
        overallScore: Number(result.overallScore || 0),

        feedback: toText(result.feedback, "No feedback provided."),
        idealAnswer: toText(result.idealAnswer, "No ideal answer provided."),
        improvement: toText(result.improvement, "No improvement provided."),
      };

      const updatedResults = [
        ...results,
        {
          question: questions[currentIndex],
          answer,
          evaluation: normalizedResult,
        },
      ];

      setFeedback(normalizedResult);
      setResults(updatedResults);
      localStorage.setItem("interviewResults", JSON.stringify(updatedResults));
    } catch (err) {
      console.error(err);

      const mockEvaluation = {
        technicalScore: 7,
        communicationScore: 7,
        confidenceScore: 7,
        overallScore: 7,
        feedback: "AI evaluation failed, so this is a demo evaluation.",
        idealAnswer:
          "This section will show an ideal answer when AI evaluation is available.",
        improvement: "Check backend API or AI quota to get real evaluation.",
      };

      const updatedResults = [
        ...results,
        {
          question: questions[currentIndex],
          answer,
          evaluation: mockEvaluation,
        },
      ];

      setFeedback(mockEvaluation);
      setResults(updatedResults);
      localStorage.setItem("interviewResults", JSON.stringify(updatedResults));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setFeedback(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/results");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center backdrop-blur-2xl">
          <Loader2
            className="mx-auto mb-4 animate-spin text-cyan-300"
            size={42}
          />
          <h2 className="text-2xl font-bold">
            Generating Interview Questions...
          </h2>
          <p className="mt-2 text-slate-400">AI is preparing your interview.</p>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-300" />
            <h1 className="text-2xl font-bold">HireSense AI</h1>
          </div>

          <div className="text-sm text-slate-300">
            {role} • {difficulty}
          </div>
        </nav>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-300">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <p className="text-sm text-cyan-300">{Math.round(progress)}%</p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            />
          </div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
              <Brain />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Interview Question</h2>
              <p className="text-sm text-slate-400">
                Answer clearly and with examples if possible.
              </p>
            </div>
          </div>

          <h3 className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-xl font-semibold leading-relaxed text-cyan-50">
            {questions[currentIndex]}
          </h3>

          <div className="mt-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <MessageSquare size={18} />
              Your Answer
            </label>

            <textarea
              rows="7"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={feedback !== null}
            />
          </div>

          {!feedback && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-bold shadow-xl hover:scale-105 transition disabled:opacity-70"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500">
                  <Trophy />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Overall Score: {feedback.overallScore}/10
                  </h2>
                  <p className="text-sm text-slate-400">
                    AI-generated answer evaluation
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-400">Technical</p>
                  <h3 className="text-3xl font-black">
                    {feedback.technicalScore}/10
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-400">Communication</p>
                  <h3 className="text-3xl font-black">
                    {feedback.communicationScore}/10
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-400">Confidence</p>
                  <h3 className="text-3xl font-black">
                    {feedback.confidenceScore}/10
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-slate-300">
                <p>
                  <b className="text-white">Feedback:</b> {feedback.feedback}
                </p>
                <p>
                  <b className="text-white">Ideal Answer:</b>{" "}
                  {feedback.idealAnswer}
                </p>
                <p>
                  <b className="text-white">Improvement:</b>{" "}
                  {feedback.improvement}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-bold shadow-xl hover:scale-105 transition"
              >
                {currentIndex + 1 === questions.length
                  ? "View Results"
                  : "Next Question"}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Interview;