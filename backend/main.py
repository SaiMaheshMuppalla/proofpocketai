"""
ProofPocket AI — FastAPI Backend
Phase 1: Health-check skeleton only.
Real endpoints (upload, extract, auth) come in Phase 3-4.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

app = FastAPI(
    title="ProofPocket AI API",
    description="Purchase-document wallet backend powered by FastAPI + Supabase",
    version="0.1.0",
)

# ── CORS ────────────────────────────────────────────────────────
# In local dev: allows Vite dev server (localhost:5173).
# In production: supports CORS_ORIGINS environment variable + Vercel/Netlify domains.
raw_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
if raw_origins:
    allowed_origins.extend([origin.strip() for origin in raw_origins.split(",") if origin.strip()])

cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX", r"https://.*(\.vercel\.app|\.netlify\.app)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ──────────────────────────────────────────────────────

@app.get("/", tags=["root"])
def root():
    """Friendly root endpoint — confirms the API is alive."""
    return {
        "message": "👋 Welcome to ProofPocket AI API",
        "docs":    "/docs",
        "status":  "running",
    }


@app.get("/health", tags=["root"])
def health():
    """Health check — used by the frontend and load balancers."""
    return {
        "status":    "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version":   "0.1.0",
    }


# ── Phase placeholders (will be implemented in later phases) ────

@app.get("/api/v1/documents", tags=["documents"])
def list_documents_placeholder():
    """
    Phase 3: Returns all documents for the authenticated user.
    For now returns an empty list so the frontend doesn't crash.
    """
    return {"documents": [], "total": 0}


@app.post("/api/v1/documents/upload", tags=["documents"])
def upload_document_placeholder():
    """
    Phase 3: Accepts a file upload, stores it in Supabase Storage,
    then triggers AI extraction. Not yet implemented.
    """
    return {"message": "Upload endpoint coming in Phase 3"}


@app.get("/api/v1/extract/{document_id}", tags=["ai"])
def extract_placeholder(document_id: str):
    """
    Phase 4: Sends the document image to Gemini API and returns
    structured JSON (merchant, date, total, items, warranty).
    """
    return {"message": f"AI extraction for '{document_id}' coming in Phase 4"}
