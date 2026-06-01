"""
Vercel Serverless Function Entry Point
This file imports the Flask app and exposes it for Vercel
"""
import sys
import os

# Add parent directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Import the Flask app
from app import app

# Vercel expects a handler named 'app'
# This is the WSGI application
