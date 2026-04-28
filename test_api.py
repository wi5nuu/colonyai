import requests
import json
import os

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "admin@colonyai.com"
PASSWORD = "admin_secure_placeholder"
IMAGE_PATH = r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\conteo_cell202404012-28-12_png.rf.336b65188af64662d0774387d4a63ff6.jpg"

def test_analysis():
    print("1. Logging in...")
    login_resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    if login_resp.status_code != 200:
        print("Login failed:", login_resp.text)
        return
    token = login_resp.json()["access_token"]
    print("Login successful! Token obtained.")

    print("\n2. Uploading image for analysis...")
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": ("case1.png", f, "image/png")}
        data = {
            "sample_id": "TEST-BOT-001",
            "media_type": "Plate Count Agar",
            "dilution_factor": "100",
            "plated_volume_ml": "1.0"
        }
        upload_resp = requests.post(
            f"{BASE_URL}/analyses/",
            headers=headers,
            files=files,
            data=data
        )

    if upload_resp.status_code != 200:
        print("Upload failed:", upload_resp.text)
        return

    analysis_data = upload_resp.json()
    print("\n--- ANALYSIS RESULTS ---")
    print(f"Sample ID: {analysis_data.get('sample_id')}")
    print(f"Status: {analysis_data.get('status')}")
    print(f"Total Colony Count: {analysis_data.get('colony_count')}")
    print(f"CFU/ml: {analysis_data.get('cfu_per_ml')}")
    print(f"Uncertainty (U): {analysis_data.get('uncertainty_u')}")
    print(f"Reliability: {analysis_data.get('reliability')}")
    
    print("\n--- 5-CLASS BREAKDOWN ---")
    breakdown = analysis_data.get('class_breakdown', {})
    print(json.dumps(breakdown, indent=2))
    
    import webbrowser
    result_url = f"http://localhost:3000/dashboard/results/{analysis_data.get('id')}"
    print(f"\nOpening result in browser: {result_url}")
    webbrowser.open(result_url)

if __name__ == "__main__":
    test_analysis()
