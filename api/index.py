"""
Vercel Python Serverless Function entry point.

Imports and serves the existing FastAPI app from backend/main.py.
Vercel automatically detects functions under api/ and looks for `app` or `handler`.
"""

import os
import sys

# Add project root to sys.path so that `backend.main` can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

# Expose both app and handler for Vercel ASGI serverless compatibility
handler = app
