# M1-P5: Hallucination-Aware Information Assistant

A full-stack, enterprise-grade AI web application designed to combat Large Language Model (LLM) overconfidence and ungrounded factual fabrication. Powered by **DeepSeek AI**, the application decomposes answers into atomic propositions, audits each claim against verifiable evidence and reference contexts, and assigns heuristic reliability indicators across three distinct confidence tiers.

Built for **academic presentation, evaluation, and college-level viva demonstrations**.

---

## 🌟 Key Features

1. **Two-Stage Generation & Verification Pipeline**
   - **Stage 1 (Generative Agent):** Synthesizes a comprehensive answer to user queries using DeepSeek Chat.
   - **Stage 2 (Independent Audit Agent):** Dissects the answer into discrete factual assertions and rigorously cross-references each statement without assuming the answer is correct merely because it sounds articulate.

2. **Three-Tier Claim Classification Engine**
   - 🟢 **High Confidence (80–100%):** Claims explicitly substantiated by user-provided reference documentation or established, universally acknowledged factual consensus.
   - 🟡 **Inferred (50–79%):** Logically derived propositions that are plausible within context but lack direct citation or empirical proof.
   - 🔴 **Potentially Hallucinated (0–49%):** Unsupported assertions, unverified dates or names, fabricated metrics, or claims contradicted by evidence.

3. **Modern Research UI (ChatGPT & Perplexity Inspired)**
   - Clean white & slate-grey aesthetic with vibrant indigo/purple accents.
   - Single-Page Application (SPA) with 5 dedicated views:
     - **Dashboard:** Dynamic LocalStorage analytics, claim distribution donut chart, lifetime statistics.
     - **Ask AI & Audit:** Multi-domain question input, optional reference text accordion, multi-stage loading stepper.
     - **Answer History:** Searchable chronological archive of previous audits.
     - **Saved Answers:** Bookmarking system for high-value research reports.
     - **How It Works (Viva Guide):** Complete architectural breakdown and college viva Q&A guide.

4. **Claim-by-Claim Interactive Feedback & Reanalysis**
   - Filter claims by category (High, Inferred, Hallucinated).
   - User feedback actions: `Mark Correct`, `Mark Incorrect`, `Needs Verification`.
   - **Evidentiary Reanalysis:** Supply additional reference documentation at any time to trigger a targeted DeepSeek re-audit of existing claims.

5. **Professional PDF Audit Export**
   - Native print/PDF stylesheet (`@media print`) that formats the generated response, claim breakdown table, and reliability score into a crisp, letterhead-style executive audit document.

6. **Demonstration Mode Out-of-the-Box**
   - Includes 5 pre-configured viva demonstration questions (including a dedicated quantum computing hallucination scenario).
   - If an API key is not yet configured, the system gracefully operates in demonstration mode so the application can be graded immediately without unexpected runtime errors.

---

## 🛠️ Technology Stack

Strictly adheres to project constraints with **zero frontend frameworks** and **no external databases**:

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **AI Integration:** DeepSeek API (`deepseek-chat` model via official compatible endpoint)
- **Data Persistence:** Browser `LocalStorage`
- **Networking:** Axios, Fetch API

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended; tested on Node.js v24)
- **npm** (v9.0.0 or higher)

### 2. Installation
Open your terminal in the project directory:
```bash
# Clone or navigate to the project directory
cd M1-P5

# Install backend dependencies
npm install
```

### 3. Configure DeepSeek API (Optional for Demo, Required for Live API)
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` in any text editor and supply your DeepSeek API key:
```env
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
PORT=3000
```
> **Note:** If no API key is provided, the application automatically launches in **Demonstration Evaluation Mode**. All 5 viva sample questions and features will be fully functional for evaluation.

### 4. Run the Application
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
hallucination-aware-assistant/
├── public/                     # Static Frontend Assets
│   ├── index.html              # Modern Dashboard & SPA Structure
│   ├── style.css               # Clean styling & print/PDF rules
│   └── script.js               # State management & LocalStorage engine
├── backend/                    # Backend API Service
│   ├── server.js               # Express server & API routes
│   └── deepseek.js             # Two-stage DeepSeek AI processing service
├── .env                        # Local environment variables
├── .env.example                # Example environment template
├── package.json                # Project dependencies & scripts
└── README.md                   # Comprehensive project documentation
```

---

## 🔬 Technical Explanation for College Viva

### 1. What causes hallucinations in LLMs?
Large Language Models are probabilistic next-token predictors trained on cross-entropy loss over web text. They lack an internal symbolic truth database or world model. When a model encounters a prompt that requires precise facts beyond its training weights, or when probabilistic ambiguity arises, it synthesizes linguistically plausible text that may be completely fabricated.

### 2. Why does the application employ a Two-Stage Pipeline?
When an LLM is asked to answer a question and assess its own accuracy in the same prompt, it exhibits severe **confirmation bias**—it naturally defends the assertions it just produced. By separating answer generation (Stage 1) from an adversarial factuality audit (Stage 2), Stage 2 treats the answer as an unverified document to be critically deconstructed into atomic propositions.

### 3. Why is Confidence Score separated from Factual Correctness?
A common misconception is that high model probability equals truth. A model can generate a false statement with 99% stylistic confidence. In this system, the **Confidence Score** is a heuristic indicator calculated based on **corroborating reference context and verified consensus**, not on how assertive the language appears.

### 4. How does the 5 Sample Viva Questions demonstrate the engine?
1. **What is Artificial Intelligence?** Demonstrates broad factual consensus, historical coining at Dartmouth (High Confidence), and theoretical AGI timelines (Inferred / Hallucinated).
2. **How Machine Learning Works:** Validates algorithmic mechanisms (gradient descent, paradigms) against textbook consensus.
3. **HTTP vs HTTPS Differences:** Checks technical RFC protocol specifications (Port 80 vs 443, TLS handshake latency).
4. **Blockchain Technology:** Demonstrates cryptographic hash linking (High Confidence) vs smart contract reentrancy vulnerability realities (Inferred).
5. **Who invented a particular technology and when? (Hallucination Test):** Prompts the model with specific corporate launch claims and exact dates, successfully isolating unverified assertions into the **Potentially Hallucinated** category.

---

## 📡 API Endpoints

### `GET /api/health`
Returns system status, active model, and whether a live DeepSeek API key is detected.

### `POST /api/ask`
Generates an answer and audits claims.
- **Request Body:**
  ```json
  {
    "question": "What are the differences between HTTP and HTTPS?",
    "context": "Optional reference documentation text",
    "responseType": "Academic Questions"
  }
  ```
- **Response Body:**
  ```json
  {
    "question": "...",
    "answer": "...",
    "overallReliability": 88,
    "claims": [
      {
        "text": "HTTP transmits data across port 80 in plaintext.",
        "category": "High Confidence",
        "confidence": 98,
        "reason": "RFC 2616 standard specification.",
        "evidence": "IETF RFC 2616."
      }
    ],
    "warnings": [],
    "verificationNeeded": false
  }
  ```

### `POST /api/reanalyze`
Re-evaluates an existing answer against newly supplied user reference text.
- **Request Body:**
  ```json
  {
    "question": "...",
    "answer": "...",
    "additionalContext": "User-supplied documentation excerpt"
  }
  ```

---

## 📄 License & Attribution
Developed for Project M1-P5 under Academic College Submission Guidelines.
Powered by DeepSeek AI.
#   m 1 - p 5  
 