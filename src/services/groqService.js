import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
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

Return ONLY a valid JSON array of strings.
No markdown. No explanation.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content;
  return JSON.parse(cleanJsonResponse(text));
}

export async function evaluateAnswer(question, answer, role) {
  const prompt = `
You are a friendly technical interviewer.

Role: ${role}

Question:
${question}

Candidate Answer:
${answer}

Evaluate fairly.

Return ONLY valid JSON:
{
  "score": 0,
  "feedback": "short feedback",
  "idealAnswer": "ideal answer under 100 words",
  "improvement": "how to improve"
}

Scoring:
0-2 = incorrect
3-5 = partially correct
6-8 = good
9-10 = excellent

No markdown. No explanation.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content;
  return JSON.parse(cleanJsonResponse(text));
}