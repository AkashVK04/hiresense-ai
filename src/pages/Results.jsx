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
  Legend,
} from "recharts";

function Results() {
  const navigate = useNavigate();

  const storedResults = localStorage.getItem("interviewResults");
  const results = storedResults ? JSON.parse(storedResults) : [];

  const role = localStorage.getItem("role") || "Frontend";
  const difficulty = localStorage.getItem("difficulty") || "Easy";

  const avg = (key) => {
    if (results.length === 0) return 0;

    const total = results.reduce((sum, item) => {
      return sum + Number(item.evaluation?.[key] || 0);
    }, 0);

    return Math.round((total / results.length) * 10);
  };

  const overallAverage = avg("overallScore");
  const technicalAverage = avg("technicalScore");
  const communicationAverage = avg("communicationScore");
  const confidenceAverage = avg("confidenceScore");

  const chartData = results.map((item, index) => ({
    question: `Q${index + 1}`,
    Overall: Number(item.evaluation?.overallScore || 0),
    Technical: Number(item.evaluation?.technicalScore || 0),
    Communication: Number(item.evaluation?.communicationScore || 0),
    Confidence: Number(item.evaluation?.confidenceScore || 0),
  }));

  const getRecommendation = () => {
    if (overallAverage >= 85) return "Strong Hire";
    if (overallAverage >= 70) return "Hire";
    if (overallAverage >= 50) return "Needs Improvement";
    return "Not Ready Yet";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("HireSense AI Interview Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Role: ${role}`, 20, 35);
    doc.text(`Difficulty: ${difficulty}`, 20, 45);
    doc.text(`Overall Score: ${overallAverage}/100`, 20, 55);
    doc.text(`Technical Score: ${technicalAverage}/100`, 20, 65);
    doc.text(`Communication Score: ${communicationAverage}/100`, 20, 75);
    doc.text(`Confidence Score: ${confidenceAverage}/100`, 20, 85);
    doc.text(`Recommendation: ${getRecommendation()}`, 20, 95);
    doc.text(`Questions Answered: ${results.length}`, 20, 105);

    let y = 125;

    results.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        doc.splitTextToSize(`Q${index + 1}: ${item.question}`, 170),
        20,
        y
      );
      y += 15;

      doc.text(
        doc.splitTextToSize(`Your Answer: ${item.answer}`, 170),
        20,
        y
      );
      y += 15;

      doc.text(`Overall: ${item.evaluation?.overallScore}/10`, 20, y);
      y += 8;
      doc.text(`Technical: ${item.evaluation?.technicalScore}/10`, 20, y);
      y += 8;
      doc.text(`Communication: ${item.evaluation?.communicationScore}/10`, 20, y);
      y += 8;
      doc.text(`Confidence: ${item.evaluation?.confidenceScore}/10`, 20, y);
      y += 12;

      doc.text(
        doc.splitTextToSize(`Feedback: ${item.evaluation?.feedback}`, 170),
        20,
        y
      );
      y += 20;

      doc.text(
        doc.splitTextToSize(`Ideal Answer: ${item.evaluation?.idealAnswer}`, 170),
        20,
        y
      );
      y += 25;

      doc.text(
        doc.splitTextToSize(`Improvement: ${item.evaluation?.improvement}`, 170),
        20,
        y
      );
      y += 25;
    });

    doc.save("HireSense_AI_Advanced_Report.pdf");
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "50px auto" }}>
      <h1>Interview Report</h1>

      <h3>Role: {role}</h3>
      <h3>Difficulty: {difficulty}</h3>

      <div
        style={{
          background: "#f1f1f1",
          padding: "20px",
          marginTop: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Overall Score: {overallAverage}/100</h2>
        <h2>Recommendation: {getRecommendation()}</h2>
        <p>Questions Answered: {results.length}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginTop: "25px",
        }}
      >
        <div style={{ background: "#f8f8f8", padding: "15px", borderRadius: "10px" }}>
          <h3>Technical</h3>
          <h2>{technicalAverage}/100</h2>
        </div>

        <div style={{ background: "#f8f8f8", padding: "15px", borderRadius: "10px" }}>
          <h3>Communication</h3>
          <h2>{communicationAverage}/100</h2>
        </div>

        <div style={{ background: "#f8f8f8", padding: "15px", borderRadius: "10px" }}>
          <h3>Confidence</h3>
          <h2>{confidenceAverage}/100</h2>
        </div>

        <div style={{ background: "#f8f8f8", padding: "15px", borderRadius: "10px" }}>
          <h3>Overall</h3>
          <h2>{overallAverage}/100</h2>
        </div>
      </div>

      <h2 style={{ marginTop: "30px" }}>Performance Analytics</h2>

      <div
        style={{
          width: "100%",
          height: "400px",
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

      <button
        onClick={downloadPDF}
        style={{
          marginRight: "10px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Download Advanced PDF Report
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
            <b>Overall Score:</b> {item.evaluation?.overallScore}/10
          </p>

          <p>
            <b>Technical Score:</b> {item.evaluation?.technicalScore}/10
          </p>

          <p>
            <b>Communication Score:</b> {item.evaluation?.communicationScore}/10
          </p>

          <p>
            <b>Confidence Score:</b> {item.evaluation?.confidenceScore}/10
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