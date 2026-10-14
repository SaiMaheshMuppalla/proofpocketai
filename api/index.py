"""
Vercel Python Serverless Function entry point.

Imports and serves the existing FastAPI app from backend/main.py.
Vercel automatically detects functions under api/ and looks for `app` or `handler`.
"""

import os
import sys

# Add project root and backend to sys.path so that `backend.main` can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app

# Expose both app and handler for Vercel ASGI serverless compatibility
handler = app
