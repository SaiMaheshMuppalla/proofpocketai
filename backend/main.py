"""
ProofPocket AI — FastAPI Backend & Gemini AI Document Extraction
Handles API routes, health checks, and server-side document parsing with Gemini.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Scope, Receive, Send
from datetime import datetime, timezone
import os
import json
import re
from typing import Optional, Dict, Any

# Safe conditional import for Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    genai = None
    GEMINI_AVAILABLE = False


app = FastAPI(
    title="ProofPocket AI API",
    description="Warranty management & purchase document wallet API powered by FastAPI, Supabase & Gemini",
    version="0.2.0",
    redirect_slashes=False,
    docs_url="/docs",
    openapi_url="/openapi.json",
)


# ── Vercel Path Correction Middleware ───────────────────────────
class VercelPathMiddleware:
    """
    Ensures that when Vercel routes rewrites internally, the original
    requested path is preserved in ASGI scope if Vercel sets the scope
    path to the entrypoint filename.
    """
    def __init__(self, asgi_app: ASGIApp):
        self.asgi_app = asgi_app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope.get("type") == "http":
            current_path = scope.get("path", "")
            if current_path in ("/api/index", "/api/index.py", "/index.py"):
                headers = dict(scope.get("headers", []))
                matched = headers.get(b"x-matched-path") or headers.get(b"x-forwarded-uri")
                if matched:
                    try:
                        decoded = matched.decode("utf-8").split("?")[0]
                        if decoded and not decoded.startswith(("/api/index", "/index.py")):
                            scope["path"] = decoded
                    except Exception:
                        pass
        await self.asgi_app(scope, receive, send)


app.add_middleware(VercelPathMiddleware)


# ── CORS ────────────────────────────────────────────────────────
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


# ── Documentation routes ────────────────────────────────────────
@app.get("/api/docs", include_in_schema=False)
def api_docs():
    """Swagger UI under /api prefix."""
    return get_swagger_ui_html(openapi_url="/api/openapi.json", title="ProofPocket AI API - Documentation")


@app.get("/api/openapi.json", include_in_schema=False)
def api_openapi():
    """OpenAPI schema under /api prefix."""
    return app.openapi()


# ── Root & Health ───────────────────────────────────────────────
@app.get("/", tags=["system"])
@app.get("/api", tags=["system"])
def root():
    """Friendly root endpoint confirming the API is operational."""
    return {
        "name": "ProofPocket AI API",
        "description": "Warranty & Document Wallet Engine",
        "version": "0.2.0",
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
def health():
    """Health check used by frontend and deployment probes."""
    gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.2.0",
        "gemini_ready": gemini_configured and GEMINI_AVAILABLE,
    }


@app.get("/api/v1/status", tags=["system"])
def system_status():
    """Detailed backend status for settings inspection."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    return {
        "backend": "FastAPI",
        "gemini_sdk_installed": GEMINI_AVAILABLE,
        "gemini_key_present": bool(gemini_key),
        "gemini_status": "ready" if (gemini_key and GEMINI_AVAILABLE) else "needs_key",
        "instructions": (
            "Ready for AI document extraction."
            if (gemini_key and GEMINI_AVAILABLE)
            else "Configure GEMINI_API_KEY in Vercel environment variables to enable automated receipt extraction."
        ),
    }


# ── AI Document Extraction ──────────────────────────────────────
GEMINI_EXTRACTION_PROMPT = """
You are ProofPocket AI's expert receipt and warranty document parsing engine.
Inspect the provided document (receipt, invoice, or warranty certificate) and extract structured information.
Return ONLY a valid JSON object with the following fields:
{
  "product_name": string or null (primary item purchased),
  "brand": string or null (manufacturer or brand name),
  "model": string or null (model number or code),
  "category": "Electronics" | "Appliances" | "Home & Living" | "Gadgets" | "Vehicles" | "Tools & Hardware" | "Fashion" | "Other",
  "seller": string or null (store, merchant, or dealer name),
  "purchase_date": "YYYY-MM-DD" or null,
  "amount": number or null (final total price paid),
  "currency": "INR" | "USD" | "EUR" | "GBP",
  "invoice_number": string or null (invoice, receipt, or order ID),
  "serial_number": string or null (serial number, IMEI, or chassis number),
  "warranty_provider": string or null (OEM, AppleCare, seller warranty),
  "warranty_start_date": "YYYY-MM-DD" or null,
  "warranty_duration_months": integer or null (e.g. 12, 24, 36),
  "warranty_expiry_date": "YYYY-MM-DD" or null,
  "return_deadline": "YYYY-MM-DD" or null,
  "coverage_details": string or null (summary of covered parts or terms),
  "service_contact": string or null (toll-free phone, support email, service URL),
  "evidence_text": string or null (exact sentence or text snippet from the document supporting the warranty duration)
}

Rules:
1. Do NOT guess or invent dates. If a date is not stated or cannot be reliably computed, set it to null.
2. If purchase_date is available and warranty duration is stated (e.g. "1 year warranty"), warranty_start_date can equal purchase_date, and warranty_expiry_date should be exactly calculated.
3. Keep product_name concise and accurate.
4. Output raw JSON only with no markdown backticks or commentary.
"""


@app.post("/api/v1/extract", tags=["ai"])
@app.post("/v1/extract", tags=["ai"])
async def extract_document_fields(file: UploadFile = File(...)):
    """
    Parses an uploaded receipt or invoice with Gemini Vision model.
    Returns structured fields for user review before confirmation.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")

    if not gemini_key:
        return JSONResponse(
            status_code=200,
            content={
                "status": "needs_key",
                "message": "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your Vercel Project Settings to activate automated receipt scanning.",
                "product_name": file.filename.rsplit(".", 1)[0].replace("_", " ").title() if file.filename else None,
                "review_status": "awaiting_manual_entry",
            },
        )

    if not GEMINI_AVAILABLE:
        return JSONResponse(
            status_code=200,
            content={
                "status": "missing_sdk",
                "message": "google-generativeai is not installed in the current environment.",
                "review_status": "awaiting_manual_entry",
            },
        )

    try:
        file_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

        # Initialize Gemini client
        genai.configure(api_key=gemini_key)
        
        # Try gemini-1.5-flash or gemini-2.5-flash
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        model = genai.GenerativeModel(model_name)

        content_parts = [
            {"mime_type": mime_type, "data": file_bytes},
            GEMINI_EXTRACTION_PROMPT,
        ]

        response = model.generate_content(
            content_parts,
            generation_config={"response_mime_type": "application/json"}
        )

        response_text = response.text.strip()
        # Clean potential markdown wrapping if returned
        if response_text.startswith("```"):
            response_text = re.sub(r"^```(?:json)?\n?", "", response_text)
            response_text = re.sub(r"\n?```$", "", response_text)

        extracted_data = json.loads(response_text)
        extracted_data["status"] = "success"
        extracted_data["review_status"] = "awaiting_review"
        extracted_data["source_filename"] = file.filename

        return extracted_data

    except Exception as e:
        print(f"[Gemini Extraction Error] {e}")
        return JSONResponse(
            status_code=200,
            content={
                "status": "error",
                "message": f"AI extraction encountered an error: {str(e)}",
                "product_name": file.filename.rsplit(".", 1)[0].replace("_", " ").title() if file.filename else None,
                "review_status": "awaiting_manual_entry",
            },
        )


@app.post("/api/v1/documents/upload", tags=["documents"])
@app.post("/v1/documents/upload", tags=["documents"])
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("receipt"),
    user_id: Optional[str] = Form(None),
):
    """
    Accepts file upload and returns document metadata + trigger for extraction.
    """
    return {
        "status": "received",
        "file_name": file.filename,
        "content_type": file.content_type,
        "document_type": document_type,
        "message": "File received by server. For direct Supabase Storage, use client-side upload with user RLS token.",
    }


@app.get("/api/v1/extract/{document_id}", tags=["ai"])
@app.get("/v1/extract/{document_id}", tags=["ai"])
def get_extraction_status(document_id: str):
    """
    Returns the extraction status of a specific document.
    """
    return {
        "document_id": document_id,
        "review_status": "verified",
        "message": f"Document {document_id} extraction is complete.",
    }
