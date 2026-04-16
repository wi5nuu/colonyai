import requests
import traceback

try:
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json={"email": "admin@colonyai.com", "password": "admin_secure_2026"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
