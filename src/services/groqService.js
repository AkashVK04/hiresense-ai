function cleanJsonResponse(text) {
  let cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");

  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");

  // Prefer JSON object first
  if (firstObject !== -1 && lastObject !== -1) {
    return cleaned.slice(firstObject, lastObject + 1);
  }

  // Otherwise JSON array
  if (firstArray !== -1 && lastArray !== -1) {
    return cleaned.slice(firstArray, lastArray + 1);
  }

  return cleaned;
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

export async function generateQuestions(
  resumeText,
  role,
  difficulty
) {
  const prompt = `
You are an expert technical interviewer.

Resume:
${resumeText}

Role:
${role}

Difficulty:
${difficulty}

Generate exactly 8 interview questions.

Rules:
- 4 technical questions
- 2 project questions
- 2 HR questions
- Return ONLY a JSON array of strings
- No markdown
`;

  const text = await callGroq(prompt);

  return JSON.parse(cleanJsonResponse(text));
}

export async function evaluateAnswer(
  question,
  answer,
  role
) {
  const prompt = `
You are an interview evaluator.

Role:
${role}

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

Rules:
- Scores must be 0 to 10
- No markdown
- No extra text
`;

  const text = await callGroq(prompt);

  return JSON.parse(cleanJsonResponse(text));
}

export async function analyzeResume(
  resumeText,
  role
) {
  const prompt = `
You are an ATS resume analyzer.

Resume:
${resumeText}

Target Role:
${role}

Return ONLY valid JSON:

{
  "resumeScore": 0,
  "skillsDetected": [],
  "projectsDetected": [],
  "missingSkills": [],
  "suggestions": [],
  "summary": ""
}

Rules:
- resumeScore should be 0 to 100
- skillsDetected should come from resume
- projectsDetected should come from resume
- missingSkills should be useful for target role
- suggestions should improve resume
- No markdown
- No extra text
`;

  const text = await callGroq(prompt);

  return JSON.parse(cleanJsonResponse(text));
}
export async function analyzePerformance(results, role) {
  const prompt = `
Analyze this mock interview performance.

Role:
${role}

Interview Results:
${JSON.stringify(results)}

Return ONLY valid JSON:

{
  "strengths": [],
  "weaknesses": [],
  "focusAreas": [],
  "finalAdvice": ""
}

Rules:
- strengths should be short points
- weaknesses should be short points
- focusAreas should be skills/topics to improve
- finalAdvice should be beginner-friendly
- No markdown
- No extra text
`;

  const text = await callGroq(prompt);
  return JSON.parse(cleanJsonResponse(text));
}