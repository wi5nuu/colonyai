import sqlite3
import os

db_path = "d:/lombapuai/backend/colonyai.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, status, requested_at, expires_at FROM password_reset_requests WHERE user_id = '8cd14668-9032-4d77-8f22-1a49fbf62e39';")
    rows = cursor.fetchall()
    
    print("RESET REQUESTS:")
    for row in rows:
        print(f"ID: {row[0]}, Status: {row[1]}, Requested: {row[2]}, Expires: {row[3]}")
        
    conn.close()
else:
    print("Database not found.")
