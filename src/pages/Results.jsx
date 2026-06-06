import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Results() {
  const navigate = useNavigate();

  const storedResults = localStorage.getItem("interviewResults");
  const results = storedResults ? JSON.parse(storedResults) : [];

  const role = localStorage.getItem("role") || "Frontend";
  const difficulty = localStorage.getItem("difficulty") || "Easy";

  const totalScore = results.reduce((sum, item) => {
    return sum + Number(item.evaluation?.score || 0);
  }, 0);

  const averageScore =
    results.length > 0 ? Math.round((totalScore / results.length) * 10) : 0;

  const chartData = results.map((item, index) => ({
    question: `Q${index + 1}`,
    score: Number(item.evaluation?.score || 0),
  }));

  const highestScore =
    results.length > 0
      ? Math.max(...results.map((r) => Number(r.evaluation?.score || 0)))
      : 0;

  const lowestScore =
    results.length > 0
      ? Math.min(...results.map((r) => Number(r.evaluation?.score || 0)))
      : 0;

  const getRecommendation = () => {
    if (averageScore >= 85) return "Strong Hire";
    if (averageScore >= 70) return "Hire";
    if (averageScore >= 50) return "Needs Improvement";
    return "Not Ready Yet";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("HireSense AI Interview Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Role: ${role}`, 20, 35);
    doc.text(`Difficulty: ${difficulty}`, 20, 45);
    doc.text(`Overall Score: ${averageScore}/100`, 20, 55);
    doc.text(`Recommendation: ${getRecommendation()}`, 20, 65);
    doc.text(`Questions Answered: ${results.length}`, 20, 75);
    doc.text(`Highest Score: ${highestScore}/10`, 20, 85);
    doc.text(`Lowest Score: ${lowestScore}/10`, 20, 95);

    let y = 115;

    results.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      const question = `Q${index + 1}: ${item.question}`;
      const answer = `Your Answer: ${item.answer}`;
      const score = `Score: ${item.evaluation?.score}/10`;
      const feedback = `Feedback: ${item.evaluation?.feedback}`;
      const idealAnswer = `Ideal Answer: ${item.evaluation?.idealAnswer}`;
      const improvement = `Improvement: ${item.evaluation?.improvement}`;

      doc.text(doc.splitTextToSize(question, 170), 20, y);
      y += 15;

      doc.text(doc.splitTextToSize(answer, 170), 20, y);
      y += 15;

      doc.text(score, 20, y);
      y += 10;

      doc.text(doc.splitTextToSize(feedback, 170), 20, y);
      y += 20;

      doc.text(doc.splitTextToSize(idealAnswer, 170), 20, y);
      y += 25;

      doc.text(doc.splitTextToSize(improvement, 170), 20, y);
      y += 25;
    });

    doc.save("HireSense_AI_Report.pdf");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "50px auto" }}>
      <h1>Interview Report</h1>

      <h3>Role: {role}</h3>
      <h3>Difficulty: {difficulty}</h3>

      <div style={{ background: "#f1f1f1", padding: "20px", marginTop: "20px" }}>
        <h2>Overall Score: {averageScore}/100</h2>
        <h2>Recommendation: {getRecommendation()}</h2>
        <p>Questions Answered: {results.length}</p>
      </div>

      <h2 style={{ marginTop: "30px" }}>Performance Analytics</h2>

      <div
        style={{
          width: "100%",
          height: "350px",
          background: "#f8f8f8",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        {results.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No chart data available.</p>
        )}
      </div>

      <div
        style={{
          background: "#f1f1f1",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <h2>Performance Analysis</h2>

        <p>
          <b>Highest Score:</b> {highestScore}/10
        </p>

        <p>
          <b>Lowest Score:</b> {lowestScore}/10
        </p>

        <p>
          <b>Average Performance:</b> {averageScore}/100
        </p>

        <p>
          <b>Hiring Recommendation:</b> {getRecommendation()}
        </p>
      </div>

      <button
        onClick={downloadPDF}
        style={{
          marginRight: "10px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Download PDF Report
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Start New Interview
      </button>

      <h2 style={{ marginTop: "30px" }}>Question-wise Performance</h2>

      {results.length === 0 && <p>No interview results found.</p>}

      {results.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>
            Q{index + 1}. {item.question}
          </h3>

          <p>
            <b>Your Answer:</b> {item.answer}
          </p>

          <p>
            <b>Score:</b> {item.evaluation?.score}/10
          </p>

          <p>
            <b>Feedback:</b> {item.evaluation?.feedback}
          </p>

          <p>
            <b>Ideal Answer:</b> {item.evaluation?.idealAnswer}
          </p>

          <p>
            <b>Improvement:</b> {item.evaluation?.improvement}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Results;