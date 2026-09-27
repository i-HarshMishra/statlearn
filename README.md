# StatLearnAI

**AI-Enabled Learning Platform for India's Official Statistical System**

StatLearnAI is a comprehensive capacity-building platform designed for officials engaged in data collection, processing, analysis, dissemination, and policy support (e.g., MoSPI). It identifies competency gaps, recommends personalized training, and leverages cutting-edge Artificial Intelligence (Google Gemini) to forecast future skills, generate insights, and automate document verification.

---

## 🏗️ Architecture Overview

The system uses a modern web stack (Next.js + Node.js) heavily integrated with the **Google Gemini API** for predictive analytics, personalized summaries, and multimodal document processing.


---

## ✨ Key AI Features

1. **AI Profile Summaries:** Automatically generates a 3-sentence professional summary identifying strengths and gaps when a learner completes their diagnostic baseline.
2. **Workforce Intelligence Forecasts:** Aggregates organization-wide skill gaps and predicts the top 3 emerging technical/statistical skills needed over the next 2 years for MoSPI officials.
3. **AI Certificate Verification:** Parses uploaded completion certificates to map external training back to internal competencies (see details below).

---

## 🤝 iGOT Integration Approach (Workaround)

A core requirement was to integrate with the **iGOT Karmayogi** ecosystem to recommend specialized courses. However, because iGOT Karmayogi currently lacks a public API for programmatic progress tracking or server-to-server completion webhooks, we implemented an **AI-driven workaround workflow**:

1. **Course Mapping:** Courses are seeded into the local database with corresponding iGOT deep-links (e.g., `https://igotkarmayogi.gov.in/course/{slug}`).
2. **Enrollment Handoff:** When a learner clicks "Enroll" on a recommendation, the system records the enrollment intent locally and seamlessly redirects the user to the exact iGOT course page in a new tab using `window.open`.
3. **Multimodal Verification:** 
   - Upon completing the course on iGOT, the user downloads their official PDF or image certificate.
   - The user returns to our platform and clicks **Upload Certificate**.
   - The file is sent via a multipart request to our Node.js backend.
   - The backend uses the **Google Gemini Vision API** (`gemini-3.8-flash` / `gemini-3.7-flash`) to parse the image, extracting the exact `"name"` and `"courseTitle"`.
4. **Fuzzy Matching & Scoring:** The system calculates a `matchConfidence` score by fuzzy-matching the extracted data against the local user's `EmployeeProfile.fullName` and the enrolled `Course.title`.
5. **Seamless Updates:** If the confidence threshold is met, the system marks the `CourseProgress` as completed and instantly recalculates and elevates the user's competency scores.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install

# Set up your environment variables
echo "DATABASE_URL=file:./dev.db" > .env
echo "JWT_SECRET=super_secret_jwt_key_123" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# Initialize database schema and seed data
npx prisma migrate dev --name init
npm run seed

# Start the backend server (runs on port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the frontend server (runs on port 3000)
npm run dev
```

### 3. Demo Credentials
Once both servers are running, access the application at `http://localhost:3000`:

* **Learner Account:** `learner@test.com` / `password123`
* **Admin Account:** `admin@test.com` / `password123`

---
*Built for the MoSPI capacity building initiative.*
