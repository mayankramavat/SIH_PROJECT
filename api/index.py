"""
Vercel Serverless Entrypoint for LMIS FastAPI Backend (SIH_26246)
-----------------------------------------------------------------
This file exposes the FastAPI ASGI `app` instance to Vercel's Python runtime.
"""
import sys
from pathlib import Path

# Add project root to sys.path so that 'backend' and 'ml' can be imported seamlessly
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import main FastAPI application instance
from backend.app.main import app
