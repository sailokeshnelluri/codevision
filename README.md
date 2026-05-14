# ⚡ CodeVision

> **AI-powered code visualization platform** — watch your code execute step by step, with live variable tracking, call stack diagrams, and plain-English AI explanations.

![CodeVision](https://img.shields.io/badge/CodeVision-v1.0-60d8ff?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🌟 What is CodeVision?

CodeVision is a full-stack educational coding platform that helps beginners deeply understand how code executes internally. Think **Python Tutor + VS Code + AI tutor** in one app.

### Features
- 🖊️ **Monaco Editor** with syntax highlighting for Python, JavaScript, C, C++, Java
- ⚡ **Step-by-step execution** — click through every line, watch it highlight live
- 📦 **Variable visualization** — animated boxes show every variable change
- 📋 **Array visualization** — indexed cells with active element highlighting
- 📚 **Call stack view** — see function frames push and pop
- 🤖 **AI explanations** — Claude explains each line in plain English
- 💾 **Save projects** — authenticated users can save and revisit work
- 🎬 **Auto-play** — watch execution animate at adjustable speed

---

## 🏗️ Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Editor      | Monaco Editor (`@monaco-editor/react`)  |
| State       | Zustand                                 |
| Backend     | FastAPI (Python 3.11)                   |
| Database    | PostgreSQL (via SQLAlchemy async)        |
| Auth        | JWT (python-jose + bcrypt)              |
| Execution   | Judge0 API (via RapidAPI)               |
| AI          | Anthropic Claude / OpenAI GPT-4         |
| Deployment  | Vercel (frontend) + Render (backend)    |

---

## 📁 Project Structure

```
codevision/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── VariablePanel.jsx
│   │   │   ├── StackPanel.jsx
│   │   │   ├── TracePanel.jsx
│   │   │   ├── AIPanel.jsx
│   │   │   └── OutputPanel.jsx
│   │   ├── pages/              # Route-level pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PlaygroundPage.jsx
│   │   │   └── ProjectsPage.jsx
│   │   ├── hooks/              # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   └── useExecutionStore.js
│   │   └── services/
│   │       └── api.js          # Axios API client
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    # FastAPI app
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings / env vars
│   ├── database.py             # SQLAlchemy async engine
│   ├── models/
│   │   └── __init__.py         # User, Project, ExecutionHistory
│   ├── auth/
│   │   └── __init__.py         # JWT helpers, get_current_user
│   ├── routes/
│   │   ├── auth.py             # /auth/register, /auth/login, /auth/me
│   │   ├── code.py             # /run-code, /visualize, /explain
│   │   └── projects.py         # /projects CRUD
│   ├── execution_engine/
│   │   └── judge0.py           # Judge0 API integration
│   ├── ai/
│   │   └── __init__.py         # Trace generation + AI explanations
│   └── requirements.txt
│
├── alembic/                    # Database migrations
│   ├── env.py
│   └── versions/
│       └── 0001_initial.py
│
├── docker-compose.yml          # Local dev with Docker
├── render.yaml                 # Render.com deployment
├── alembic.ini
└── .env.example
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (or Docker)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/your-username/codevision.git
cd codevision
```

---

### Step 2 — Set up the backend

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Copy and configure environment variables
cp .env.example .env
# → Open .env and fill in your keys (see API Keys section below)
```

---

### Step 3 — Set up the database

**Option A — Docker (easiest)**
```bash
docker-compose up db -d
```

**Option B — Local PostgreSQL**
```bash
psql -U postgres -c "CREATE DATABASE codevision;"
```

Then run migrations:
```bash
alembic upgrade head
```

---

### Step 4 — Start the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### Step 5 — Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=/api (works with Vite proxy)
npm run dev
```

Frontend runs at: http://localhost:3000

---

### Step 6 — Docker Compose (all-in-one)

Alternatively, run everything with one command:

```bash
cp .env.example .env          # Fill in API keys first
docker-compose up --build
```

---

## 🔑 API Keys You Need

### 1. Judge0 (Code Execution) — Required for real compilation
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up for a free account
3. Subscribe to the **Basic** (free) plan
4. Copy your `X-RapidAPI-Key`
5. Add to `.env`:
   ```
   JUDGE0_API_KEY=your_key_here
   ```

> **Note:** Without Judge0, the `/run-code` endpoint returns an error, but `/visualize` still works using AI-generated traces.

---

### 2. Anthropic API — Required for AI features
1. Go to https://console.anthropic.com
2. Create an account and generate an API key
3. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

> **Fallback:** If you prefer OpenAI, set `OPENAI_API_KEY` instead.

---

### 3. Generate a secure JWT secret
```bash
python -c "import secrets; print(secrets.token_hex(64))"
```
Paste the output into `SECRET_KEY` in `.env`.

---

## 🗄️ Database Schema

### `users`
| Column     | Type        | Description           |
|------------|-------------|-----------------------|
| id         | UUID string | Primary key           |
| name       | VARCHAR(100)| Display name          |
| email      | VARCHAR(255)| Unique, indexed       |
| password   | VARCHAR(255)| Bcrypt hashed         |
| created_at | TIMESTAMP   | Auto                  |
| updated_at | TIMESTAMP   | Auto                  |

### `projects`
| Column          | Type     | Description                    |
|-----------------|----------|--------------------------------|
| id              | UUID     | Primary key                    |
| user_id         | FK→users | Owner                          |
| name            | VARCHAR  | Project name                   |
| code            | TEXT     | Source code                    |
| language        | VARCHAR  | python/javascript/c/cpp/java   |
| execution_trace | JSON     | Saved visualization steps      |
| created_at      | TIMESTAMP|                                |
| updated_at      | TIMESTAMP|                                |

### `execution_history`
| Column         | Type     | Description              |
|----------------|----------|--------------------------|
| id             | UUID     | Primary key              |
| user_id        | FK→users | Runner                   |
| code           | TEXT     | Code that was run        |
| language       | VARCHAR  | Language used            |
| output         | TEXT     | stdout                   |
| error          | TEXT     | stderr / compile error   |
| steps_count    | INT      | Number of trace steps    |
| execution_time | VARCHAR  | Execution time from Judge0 |
| created_at     | TIMESTAMP|                          |

---

## 🌐 API Reference

All endpoints (except `/health`) require `Authorization: Bearer <token>`.

### Authentication
| Method | Path              | Description          |
|--------|-------------------|----------------------|
| POST   | /auth/register    | Create account       |
| POST   | /auth/login       | Get JWT token        |
| GET    | /auth/me          | Get current user     |

### Code Execution
| Method | Path        | Description                                 |
|--------|-------------|---------------------------------------------|
| POST   | /run-code   | Execute code, return stdout/stderr           |
| POST   | /visualize  | Execute + generate AI step-by-step trace     |
| POST   | /explain    | AI explanation for a line or whole code      |

**POST /visualize — Request:**
```json
{
  "code": "x = 5\ny = x + 2\nprint(y)",
  "language": "python"
}
```

**POST /visualize — Response:**
```json
{
  "steps": [
    {
      "line": 1,
      "code": "x = 5",
      "variables": { "x": { "value": 5, "type": "int", "changed": true } },
      "arrays": {},
      "stack": [{ "name": "main", "line": 1 }],
      "explanation": "Variable x is created and assigned the value 5.",
      "output": null
    }
  ],
  "output": "7\n",
  "error": "",
  "step_count": 3
}
```

### Projects
| Method | Path               | Description         |
|--------|--------------------|---------------------|
| GET    | /projects          | List all projects   |
| GET    | /projects/{id}     | Get one project     |
| POST   | /projects          | Create project      |
| PUT    | /projects/{id}     | Update project      |
| DELETE | /projects/{id}     | Delete project      |

---

## 🚢 Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com
   ```
5. Deploy

---

### Backend → Render

**Option A — render.yaml (auto-deploy)**
1. Push repo to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your repo — Render reads `render.yaml` automatically
4. In the Render dashboard, set secret env vars:
   - `ANTHROPIC_API_KEY`
   - `JUDGE0_API_KEY`
   - `SECRET_KEY`

**Option B — Manual**
1. New → Web Service → Connect repo
2. Runtime: Python
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add all env vars from `.env.example`

**After deploying the backend:**
```bash
# Run migrations on production DB
DATABASE_URL=your_prod_url alembic upgrade head
```

---

## 🔒 Security

- All passwords hashed with **bcrypt**
- JWT tokens expire after **7 days** (configurable)
- **Rate limiting**: 10 runs/minute, 30 explains/minute per IP
- **Input validation**: max 10,000 characters, allowlisted languages only
- Code executes in **Judge0's sandboxed environment** (not on your server)
- CORS is restricted to your listed origins

---

## 🛠️ Development Tips

### Running without Judge0
The `/visualize` endpoint works without Judge0 — it uses AI to simulate execution traces. Only real stdout output is missing. Set `JUDGE0_API_KEY=` (empty) in `.env` to skip Judge0.

### Running without AI keys
If neither `ANTHROPIC_API_KEY` nor `OPENAI_API_KEY` is set, the AI module returns a minimal static trace (one step per non-empty line). Useful for testing.

### Adding a new language
1. Add to `LANGUAGE_IDS` in `backend/execution_engine/judge0.py`
2. Add to `ALLOWED_LANGUAGES` in `backend/routes/code.py`
3. Add to `LANGUAGES` array in `frontend/src/pages/PlaygroundPage.jsx`
4. Add a default sample in `DEFAULTS` in `PlaygroundPage.jsx`

---

## 🗺️ Roadmap

- [ ] Real-time collaborative coding (WebSockets)
- [ ] Voice explanations (text-to-speech)
- [ ] AI chatbot tutor sidebar
- [ ] DSA visualization mode (trees, graphs, sorting)
- [ ] Flowchart auto-generation
- [ ] Classroom mode for teachers
- [ ] Interview prep mode
- [ ] Code complexity analysis (Big-O)
- [ ] Multiplayer coding challenges

---

## 📄 License

MIT © CodeVision

---

*Built with ❤️ for learners everywhere.*
