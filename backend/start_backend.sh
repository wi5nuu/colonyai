#!/bin/bash
pip install email-validator
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
.\start_backend.bat