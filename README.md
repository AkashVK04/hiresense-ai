# HireSense AI

An AI-powered resume-based mock interview and performance evaluation platform designed to help students prepare for technical interviews through personalized AI feedback.

---

## Overview

HireSense AI analyzes a candidate's resume, generates role-specific interview questions using AI, evaluates responses, provides detailed performance analytics, and creates a personalized learning roadmap to improve interview skills.

---

## Features

* Google Authentication using Firebase
* Resume PDF Upload & Text Extraction
* AI Resume Analysis
* Role & Difficulty Selection
* AI-Based Interview Question Generation
* AI Answer Evaluation
* Technical, Communication & Confidence Scoring
* Overall Hiring Recommendation
* Interactive Performance Dashboard
* AI Strengths & Weaknesses Analysis
* Personalized Learning Roadmap
* Interview History using Firestore
* Downloadable PDF Interview Report
* Modern Responsive UI

---

## Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion

### Backend / Cloud

* Firebase Authentication
* Firebase Firestore
* Vercel Serverless Functions

### AI

* Groq API (LLM)

### Libraries

* PDF.js
* jsPDF
* Recharts
* Lucide React

---

## Project Workflow

1. User signs in using Google.
2. Uploads Resume (PDF).
3. Resume text is extracted.
4. AI analyzes the resume.
5. User selects role and difficulty.
6. AI generates interview questions.
7. User answers each question.
8. AI evaluates every answer.
9. Performance analytics are generated.
10. Interview report is saved in Firestore.
11. User downloads a PDF report.

---

## Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hiresense-ai.git
cd hiresense-ai
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Run serverless APIs

```bash
vercel dev
```

---

## Environment Variables

Create a `.env.local` file.

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

## Future Enhancements

* Company-specific interview rounds
* Coding assessment module
* ATS Resume Score Analyzer
* Video Interview Analysis
* Admin Analytics Dashboard
* Multi-language Interview Support

---

## Developed By

**Akash V K**

Computer Science & Engineering Student

---

## License

This project is developed for educational and academic purposes.
