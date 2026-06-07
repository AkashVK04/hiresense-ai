import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

      navigate("/interview");
    } catch (error) {
      console.error("Resume Error:", error);
      alert(error.message || "Failed to read or analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center" }}>
      <h1>Upload Resume</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setResume(e.target.files[0])}
      />

      <br />
      <br />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Frontend</option>
        <option>Java</option>
        <option>Full Stack</option>
        <option>Data Analyst</option>
        <option>AI/ML</option>
        <option>System Design</option>
      </select>

      <br />
      <br />

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <br />
      <br />

      <button onClick={handleStart} disabled={loading}>
        {loading ? "Analyzing Resume..." : "Start Interview"}
      </button>
    </div>
  );
}

export default UploadResume;