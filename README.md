# ProofPocket AI 🗂️

> **BTech AIML Minor Project** — A complete, AI-powered purchase-document wallet.
> Upload receipts, bills, and warranty cards. AI extracts the data. You stay organised.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + TypeScript + Vite      |
| Styling    | Tailwind CSS v4                   |
| Backend    | Python FastAPI + Uvicorn          |
| Database   | Supabase (Postgres + Storage)     |
| AI / OCR   | Google Gemini API                 |

---

## Project Structure

```
Minor Project/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   └── pages/
│   │       └── LandingPage.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── backend/           # FastAPI app
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example   ← copy to .env and fill secrets
│
├── .gitignore
└── README.md
```

---

## Running Locally

### 1. Start the backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # fill in your keys
uvicorn main:app --reload --port 8000
```

API is live at → http://localhost:8000  
Interactive docs → http://localhost:8000/docs

### 2. Start the frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App is live at → http://localhost:5173

---

## Build Phases

- [x] **Phase 1** — Foundation: project structure, landing page, API skeleton ✅
- [ ] **Phase 2** — Auth: Supabase Auth, login/signup, protected routes
- [ ] **Phase 3** — Upload: file upload to Supabase Storage, document list
- [ ] **Phase 4** — AI Extraction: Gemini reads document, saves structured data
- [ ] **Phase 5** — Dashboard: search, filter, category view
- [ ] **Phase 6** — Export & Warranty Alerts: PDF export, email notifications

---

## Getting API Keys

| Key | Where to get it |
|-----|----------------|
| `SUPABASE_URL` + `SUPABASE_KEY` | [supabase.com](https://supabase.com) → Project → Settings → API |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) (free) |

---

*Built by Muppalla Sai Mahesh — BTech AIML*
