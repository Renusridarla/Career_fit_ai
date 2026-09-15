import sys
import os

# Add backend directory to sys.path for Vercel Python serverless runtime
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
