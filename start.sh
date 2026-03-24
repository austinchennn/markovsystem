#!/bin/bash

# One-Click Start Script for Markov System (Python Backend + Next.js Frontend)

# Function to detect OS/Open command
open_browser() {
  if command -v open &> /dev/null; then
    open "$1"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "$1"
  else
    echo "Please open $1 in your browser."
  fi
}

cleanup() {
    echo ""
    echo "[Switching Off] Stopping Metadata Refinement..."
    pkill -f "flask"
    pkill -f "next-server"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT

echo "============================================"
echo "   Severance Markov System - Starting..."
echo "============================================"

# Navigate to project root if running from inside a subdirectory
PROJ_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJ_ROOT"

# 1. Setup Backend
echo "[System] Initializing Python Core..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "venv" ]; then
        echo "[Backend] Creating virtual environment..."
        python3 -m venv venv
    fi
    
    echo "[Backend] Activating venv..."
    source venv/bin/activate
    
    echo "[Backend] Installing dependencies..."
    pip install -r requirements.txt
    
    echo "[Backend] Starting Flask API Server on :5000..."
    # Run in background, log directly to console or redirect
    export FLASK_APP=app.py
    flask run --port=5000 &
    BACKEND_PID=$!
    
    cd ..
else
    echo "Error: 'backend' directory not found."
    exit 1
fi

sleep 3

# 2. Setup Frontend
echo "[System] Initializing Visualization Interface..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "[Frontend] Installing npm packages (first time setup)..."
        npm install
    fi
    
    echo "[Frontend] Starting Next.js..."
    # Open browser in background after 5 seconds
    (sleep 5 && open "http://localhost:3000") &
    
    npm run dev
else
    echo "Error: 'frontend' directory not found."
fi

# Wait for backend to finish (which is never unless killed)
wait $BACKEND_PID
