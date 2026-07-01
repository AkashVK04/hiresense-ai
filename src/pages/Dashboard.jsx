import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Sparkles, History, Trophy, RotateCcw } from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "interviewReports"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [currentUser]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-300" />
            <h1 className="text-2xl font-bold">HireSense AI Dashboard</h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-semibold hover:bg-white/20 transition"
          >
            Home
          </button>
        </nav>

        <section className="py-10">
          <h2 className="text-5xl font-black">Interview History</h2>
          <p className="mt-3 text-slate-300">
            View your previous AI mock interview reports.
          </p>
        </section>

        {!currentUser && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl">
            <p>Please sign in to view interview history.</p>
          </div>
        )}

        {loading && <p>Loading reports...</p>}

        {currentUser && !loading && reports.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl text-center">
            <History className="mx-auto mb-4 text-cyan-300" size={48} />
            <h3 className="text-2xl font-bold">No reports yet</h3>
            <p className="mt-2 text-slate-400">
              Complete an interview to see your history.
            </p>

            <button
              onClick={() => navigate("/upload")}
              className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-bold"
            >
              Start Interview
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500">
                <Trophy />
              </div>

              <h3 className="text-xl font-bold">{report.role}</h3>
              <p className="text-sm text-slate-400">
                Difficulty: {report.difficulty}
              </p>

              <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                <p className="text-slate-400">Overall Score</p>
                <h2 className="text-4xl font-black">
                  {report.overallScore}/100
                </h2>
              </div>

              <p className="mt-4 text-slate-300">
                Recommendation:{" "}
                <span className="font-bold text-cyan-300">
                  {report.recommendation}
                </span>
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {report.createdAt?.toDate
                  ? report.createdAt.toDate().toLocaleString()
                  : "Saved report"}
              </p>

              <button
                onClick={() => {
                  localStorage.setItem(
                    "interviewResults",
                    JSON.stringify(report.results)
                  );
                  localStorage.setItem(
                    "resumeAnalysis",
                    JSON.stringify(report.resumeAnalysis)
                  );
                  localStorage.setItem("role", report.role);
                  localStorage.setItem("difficulty", report.difficulty);
                  navigate("/results");
                }}
                className="mt-5 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold hover:bg-white/20 transition"
              >
                <RotateCcw size={18} />
                View Report
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;