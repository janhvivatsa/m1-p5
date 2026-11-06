
  # M1-P5: Hallucination-Aware Information Verification System

  A full-stack web application designed to identify unsupported, inaccurate, and potentially fabricated information through claim-level verification and evidence-based evaluation.

  ## Features

  - **Two-Stage Processing:** Generates responses and independently verifies individual claims.
  - **Claim Classification:** Categorizes claims into High Confidence, Inferred, and Potentially Unverified.
  - **Interactive Dashboard:** Displays reliability statistics and claim distribution.
  - **Answer History:** Stores and searches previous reports.
  - **Saved Answers:** Bookmarks important verification reports.
  - **Claim Feedback:** Mark claims as correct, incorrect, or requiring verification.
  - **Evidence-Based Reanalysis:** Re-evaluates claims using additional reference documentation.
  - **PDF Export:** Generates formatted verification reports.
  - **Demonstration Mode:** Includes five sample questions for academic evaluation.

  ## Technology Stack

  | Component | Technology |
  |---|---|
  | Frontend | HTML5, CSS3, Vanilla JavaScript |
  | Backend | Node.js, Express.js |
  | Data Storage | Browser LocalStorage |
  | Networking | Axios, Fetch API |

  ## Installation and Setup

  ### Prerequisites

  - Node.js 18 or higher
  - npm 9 or higher

  ### Installation

  ```bash
  # Navigate to project directory
  cd M1-P5

  # Install dependencies
  npm install
  ```

  ### Run Application

  ```bash
  npm start
  ```

  Open your browser and visit:

  http://localhost:3000

  ## Project Structure

  ```text
  M1-P5/
  ├── public/
  │   ├── index.html
  │   ├── style.css
  │   └── script.js
  ├── backend/
  │   ├── server.js
  │   └── deepseek.js
  ├── .env.example
  ├── package.json
  └── README.md
  ```

  ## API Endpoints

  | Method | Endpoint | Description |
  |---|---|---|
  | GET | `/api/health` | Checks application status |
  | POST | `/api/ask` | Processes queries and verifies claims |
  | POST | `/api/reanalyze` | Re-evaluates claims using additional evidence |

  ## Claim Classification

  | Category | Score | Description |
  |---|---:|---|
  | High Confidence | 80–100% | Supported by available evidence |
  | Inferred | 50–79% | Logically derived but not directly verified |
  | Potentially Unverified | 0–49% | Unsupported or potentially inaccurate |

  ## Project Objective

  To improve information reliability through claim-level verification, evidence-based evaluation, and transparent confidence classification.

  ---

  **Project:** M1-P5  
  **Purpose:** Academic Research and Information Verification