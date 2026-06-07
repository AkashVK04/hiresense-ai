import { useEffect, useState } from "react";
import { generateQuestions, evaluateAnswer } from "../services/groqService";
import { startRecording, stopRecording } from "../utils/audioRecorder";
import { useNavigate } from "react-router-dom";

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [recording, setRecording] = useState(false);

  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "Frontend";
  const difficulty = localStorage.getItem("difficulty") || "Easy";
  const resumeText = localStorage.getItem("resumeText") || "";

  const fallbackQuestions = [
    "What is the difference between HTML, CSS, and JavaScript?",
    "Explain the CSS box model.",
    "What is the difference between id and class in HTML?",
    "What is React and why is it used?",
    "Explain one project from your resume.",
    "What challenges did you face in your project?",
    "Tell me about yourself.",
    "Why should we hire you for this role?",
  ];

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

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setRecording(true);
    } catch (error) {
      console.error(error);
      alert("Microphone permission denied or recording failed.");
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      setRecording(false);

      console.log("Recorded audio:", audioBlob);
      alert("Audio recorded successfully. Transcription will be added next.");
    } catch (error) {
      console.error(error);
      alert("Failed to stop recording.");
    }
  };

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
        feedback: result.feedback || "No feedback provided.",
        idealAnswer: result.idealAnswer || "No ideal answer provided.",
        improvement: result.improvement || "No improvement provided.",
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
        improvement:
          "Check backend API or AI quota to get real evaluation.",
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

  if (loading) return <h2>Generating Questions...</h2>;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto" }}>
      <h1>AI Mock Interview</h1>

      <p>
        Role: {role} | Difficulty: {difficulty}
      </p>

      <div style={{ background: "#ddd", height: "10px", borderRadius: "10px" }}>
        <div
          style={{
            width: `${progress}%`,
            background: "green",
            height: "10px",
            borderRadius: "10px",
          }}
        ></div>
      </div>

      <h2>
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <h3>{questions[currentIndex]}</h3>

      <textarea
        rows="6"
        style={{ width: "100%", padding: "10px" }}
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={feedback !== null}
      />

      <br />
      <br />

      {!feedback && (
        <>
          {!recording ? (
            <button
              onClick={handleStartRecording}
              disabled={evaluating}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              🎙️ Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              ⏹ Stop Recording
            </button>
          )}

          <button onClick={handleSubmitAnswer} disabled={evaluating}>
            {evaluating ? "Evaluating..." : "Submit Answer"}
          </button>

          <p style={{ fontSize: "12px", color: "gray" }}>
            Voice recording is enabled. Speech-to-text transcription will be
            connected next.
          </p>
        </>
      )}

      {feedback && (
        <div
          style={{
            marginTop: "20px",
            background: "#f1f1f1",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Overall Score: {feedback.overallScore}/10</h2>

          <p>
            <b>Technical Score:</b> {feedback.technicalScore}/10
          </p>

          <p>
            <b>Communication Score:</b> {feedback.communicationScore}/10
          </p>

          <p>
            <b>Confidence Score:</b> {feedback.confidenceScore}/10
          </p>

          <p>
            <b>Feedback:</b> {feedback.feedback}
          </p>

          <p>
            <b>Ideal Answer:</b> {feedback.idealAnswer}
          </p>

          <p>
            <b>Improvement:</b> {feedback.improvement}
          </p>

          <button onClick={handleNext}>
            {currentIndex + 1 === questions.length
              ? "View Results"
              : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Interview;