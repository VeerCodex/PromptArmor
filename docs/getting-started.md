# Getting Started with PromptArmor

PromptArmor is a complete security platform designed to shield LLM applications from prompt injection, jailbreak attempts, PII leakage, and output data leakage.

## Architecture

PromptArmor operates as a security gateway proxy or middleware:

```
                  ┌────────────────────────┐
                  │   PromptArmor Shield   │
                  └───────────┬────────────┘
                              │ (15ms Scan)
                              ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  User Input  │───>│   FastAPI API    │───>│  LLM Engine  │
└──────────────┘    └──────────────────┘    └──────────────┘
```

## Setup Options

### Option 1: Running Locally (Docker Compose)
The easiest way to run the entire PromptArmor platform is using Docker Compose. Make sure you have Docker installed, then run from the root directory:

```bash
docker-compose up --build
```

This starts:
- **FastAPI Backend API** on `http://localhost:8000`
- **PostgreSQL Database** for logs storage
- **Redis Cache** for fast repeat threat caching
- **Next.js Dashboard** on `http://localhost:3000`

### Option 2: Running Services Manually

#### 1. Backend (FastAPI)
Navigate to `backend/`, install dependencies, and run:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 2. Dashboard (Next.js)
Navigate to `dashboard/`, install node modules, and run the developer server:

```bash
cd dashboard
npm install
npm run dev
```

---

## Standard Integration Flow

1. Register an account on the **Dashboard** (`http://localhost:3000/register`).
2. Go to the **API Keys** section and generate an API key.
3. Install the SDK package matching your runtime environment.
4. Set the API key in your code and scan input/output.
