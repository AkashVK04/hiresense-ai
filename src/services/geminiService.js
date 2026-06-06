import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key missing. Check .env file.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

function cleanJsonResponse(text) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function generateQuestions(resumeText, role, difficulty) {
  const prompt = `
You are an expert technical interviewer.

Candidate Resume:
${resumeText}

Role: ${role}
Difficulty: ${difficulty}

Generate exactly 8 interview questions:
1. 4 technical questions related to the selected role
2. 2 project-based questions based on the resume
3. 2 HR questions

Rules:
- Questions should match the candidate resume
- Questions should match the difficulty level
- Do not give answers
- Return ONLY a valid JSON array of strings
- No markdown
- No explanation

Example:
[
  "Explain React hooks and why they are useful.",
  "Tell me about one project from your resume and your role in it."
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const cleanText = cleanJsonResponse(response.text);
  return JSON.parse(cleanText);
}

export async function evaluateAnswer(question, answer, role) {
  const prompt = `
You are a friendly technical interviewer and interview evaluator.

Role: ${role}

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer fairly.

Scoring Guide:
0-2 = Incorrect or unrelated answer
3-5 = Partially correct answer
6-8 = Good answer with minor missing points
9-10 = Excellent answer with clear explanation and examples

Return ONLY valid JSON in this format:
{
  "score": 0,
  "feedback": "short feedback",
  "idealAnswer": "ideal answer",
  "improvement": "how to improve"
}

Rules:
- Score must be from 0 to 10
- Reward partial understanding
- Do not be overly harsh
- Feedback should be simple and clear
- Ideal answer should be beginner-friendly
- Keep ideal answer under 100 words
- No markdown
- No extra explanation
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const cleanText = cleanJsonResponse(response.text);
  return JSON.parse(cleanText);
}