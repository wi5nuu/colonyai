#!/usr/bin/env python3
"""
ColonyAI Connection Diagnostic Tool
Membantu troubleshoot masalah koneksi frontend-backend
"""

import os
import sys
import json
from pathlib import Path

def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")

def print_ok(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"⚠️  {text}")

def check_env_file():
    """Check if .env file exists"""
    print_header("1. CHECKING ENVIRONMENT CONFIGURATION")
    env_path = Path("backend/.env")

    if env_path.exists():
        print_ok(f"Found .env file: {env_path}")
        # Read and show important vars
        with open(env_path, 'r') as f:
            content = f.read()
            if "DEBUG=True" in content:
                print_ok("DEBUG mode is ON")
            if "DATABASE_URL=" in content:
                if "sqlite" in content:
                    print_ok("Using SQLite database (development)")
                elif "postgresql" in content:
                    print_ok("Using PostgreSQL database")
    else:
        print_error(f".env file not found at {env_path}")
        print_warning("Run: copy backend\\.env.example backend\\.env")
        return False

    return True

def check_database():
    """Check database files"""
    print_header("2. CHECKING DATABASE")

    db_path = Path("backend/colonyai.db")

    if db_path.exists():
        size_mb = db_path.stat().st_size / (1024 * 1024)
        print_ok(f"Database file exists: {db_path} ({size_mb:.2f} MB)")
    else:
        print_warning(f"Database file not found: {db_path}")
        print_warning("It will be created when backend starts for the first time")

    return True

def check_upload_directory():
    """Check upload directories"""
    print_header("3. CHECKING UPLOAD DIRECTORIES")

    base_path = Path("backend/uploads")
    subdirs = ["original", "annotated", "reports"]

    if base_path.exists():
        print_ok(f"Upload directory exists: {base_path}")
        for subdir in subdirs:
            subdir_path = base_path / subdir
            if subdir_path.exists():
                count = len(list(subdir_path.glob("*")))
                print_ok(f"  - {subdir}/: {count} files")
            else:
                print_warning(f"  - {subdir}/: not created yet")
    else:
        print_warning(f"Upload directory not found: {base_path}")
        print_warning("It will be created when backend starts")

    return True

def check_model_files():
    """Check model files"""
    print_header("4. CHECKING MODEL FILES")

    model_path = Path("backend/models/colony_best.pt")

    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        print_ok(f"Model file exists: {model_path} ({size_mb:.2f} MB)")
    else:
        print_warning(f"Model file not found: {model_path}")
        print_warning("Upload image will fail until model is downloaded")

    # Check alternative model locations
    yolo_alternatives = [
        Path("backend/yolov8n.pt"),
        Path("backend/yolov8s.pt"),
        Path("ml-training/colony_best.pt"),
    ]

    for alt_path in yolo_alternatives:
        if alt_path.exists():
            print_warning(f"Found alternative model: {alt_path}")
            print_warning(f"Consider copying to backend/models/colony_best.pt")

    return True

def check_cors_config():
    """Check CORS configuration"""
    print_header("5. CHECKING CORS CONFIGURATION")

    config_path = Path("backend/app/core/config.py")

    if config_path.exists():
        with open(config_path, 'r') as f:
            content = f.read()
            if "BACKEND_CORS_ORIGINS" in content:
                print_ok("CORS configuration found in config.py")
                if "localhost:3000" in content:
                    print_ok("Frontend localhost:3000 is allowed")
                else:
                    print_warning("Frontend localhost:3000 might not be allowed")
            else:
                print_error("CORS configuration not found")

    # Check .env for CORS
    env_path = Path("backend/.env")
    if env_path.exists():
        with open(env_path, 'r') as f:
            content = f.read()
            if "localhost:3000" in content:
                print_ok("CORS configured in .env to allow localhost:3000")

    return True

def check_frontend_config():
    """Check frontend configuration"""
    print_header("6. CHECKING FRONTEND CONFIGURATION")

    env_path = Path("frontend/.env.local")

    if env_path.exists():
        with open(env_path, 'r') as f:
            content = f.read()
            if "NEXT_PUBLIC_API_URL" in content:
                if "localhost:8000" in content or "8000" in content:
                    print_ok("Frontend API URL configured to point to localhost:8000")
                else:
                    print_warning("Frontend API URL might not be correct")
            else:
                print_error("API URL not configured in .env.local")
    else:
        print_warning(f".env.local not found: {env_path}")
        print_warning("Run: copy frontend\\.env.example frontend\\.env.local")

    return True

def check_backend_routes():
    """Check if backend routes are properly registered"""
    print_header("7. CHECKING BACKEND ROUTES")

    main_path = Path("backend/main.py")
    analyses_path = Path("backend/app/api/v1/endpoints/analyses.py")
    images_path = Path("backend/app/api/v1/endpoints/images.py")

    routes = {
        "main.py": main_path,
        "analyses endpoint": analyses_path,
        "images endpoint": images_path,
    }

    for name, path in routes.items():
        if path.exists():
            print_ok(f"Route file exists: {name}")
        else:
            print_error(f"Route file missing: {name}")

    # Check if POST /api/v1/analyses is registered
    if analyses_path.exists():
        with open(analyses_path, 'r') as f:
            content = f.read()
            if "@router.post" in content:
                print_ok("POST endpoint for analyses is registered")
            else:
                print_error("POST endpoint for analyses not found")

    return True

def print_next_steps():
    """Print next steps"""
    print_header("📋 NEXT STEPS")

    print("""
1. Make sure .env file exists:
   cd backend
   copy .env.example .env

   Then edit .env and update SECRET_KEY and JWT_SECRET_KEY

2. Start the backend:
   .venv\\Scripts\\activate
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

   Check that you see: "Uvicorn running on http://0.0.0.0:8000"

3. In a new terminal, start the frontend:
   cd frontend
   npm run dev

   Check that you see: "ready started server on 0.0.0.0:3000"

4. Test the connection:
   - Backend: http://localhost:8000/health
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

5. Test upload:
   - Login to frontend with admin@colonyai.com / [REDACTED_SECRET]
   - Go to Dashboard → Upload
   - Try uploading an image

6. Check browser console for errors:
   - Open DevTools (F12)
   - Check Console tab for any error messages
   - Check Network tab to see API requests
    """)

def main():
    """Run all checks"""
    print("\n🔍 ColonyAI Connection Diagnostic Tool")
    print("=" * 60)

    checks = [
        check_env_file,
        check_database,
        check_upload_directory,
        check_model_files,
        check_cors_config,
        check_frontend_config,
        check_backend_routes,
    ]

    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except Exception as e:
            print_error(f"Check failed: {e}")
            results.append(False)

    print_next_steps()

    # Summary
    print_header("SUMMARY")
    if all(results):
        print_ok("All checks passed! Your setup looks good.")
        print("Now make sure both backend and frontend are running.")
    else:
        print_warning("Some checks failed or warned. Review the output above.")

    print()

if __name__ == "__main__":
    main()
