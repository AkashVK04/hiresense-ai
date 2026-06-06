import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractTextFromPDF } from "../utils/pdfReader";

function UploadResume() {
  const [resume, setResume] = useState(null);
  const [role, setRole] = useState("Frontend");
  const [difficulty, setDifficulty] = useState("Easy");

  const navigate = useNavigate();

  const handleStart = async () => {
    if (!resume) {
      alert("Please upload your resume PDF");
      return;
    }

    try {
      const resumeText = await extractTextFromPDF(resume);

      localStorage.setItem("resumeText", resumeText);
      localStorage.setItem("role", role);
      localStorage.setItem("difficulty", difficulty);

      navigate("/interview");
    } catch (error) {
      console.error(error);
      alert("Failed to read PDF");
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

      <br /><br />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Frontend</option>
        <option>Java</option>
        <option>Full Stack</option>
        <option>Data Analyst</option>
      </select>

      <br /><br />

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <br /><br />

      <button onClick={handleStart}>
        Start Interview
      </button>
    </div>
  );
}

export default UploadResume;