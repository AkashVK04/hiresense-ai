function cleanJsonResponse(text) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function callGroq(prompt) {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const rawText = await response.text();

  let data;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(rawText || "Server returned invalid response");
  }

  if (!response.ok) {
    throw new Error(data.error || "Groq API request failed");
  }

  return data.choices?.[0]?.message?.content || "{}";
}

export async function generateQuestions(resumeText, role, difficulty) {
  const prompt = `
Generate exactly 8 interview questions for ${role} role.
Difficulty: ${difficulty}

Candidate Resume:
${resumeText}

Return ONLY a valid JSON array of strings.
`;

  const text = await callGroq(prompt);
  return JSON.parse(cleanJsonResponse(text));
}

export async function evaluateAnswer(question, answer, role) {
  const prompt = `
Evaluate this interview answer for ${role} role.

Question:
${question}

Candidate Answer:
${answer}

Return ONLY valid JSON:
{
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "overallScore": 0,
  "feedback": "",
  "idealAnswer": "",
  "improvement": ""
}
`;

  const text = await callGroq(prompt);
  return JSON.parse(cleanJsonResponse(text));
}

export async function analyzeResume(resumeText, role) {
  const prompt = `
Analyze this resume for ${role} role.

Resume:
${resumeText}

Return ONLY valid JSON:
{
  "resumeScore": 0,
  "skillsDetected": [],
  "projectsDetected": [],
  "missingSkills": [],
  "suggestions": [],
  "summary": ""
}
`;

  const text = await callGroq(prompt);
  return JSON.parse(cleanJsonResponse(text));
}