import sqlite3
import os

db_path = "d:/lombapuai/backend/colonyai.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, role, organization_id FROM users WHERE email = 'wisnu.ashar@gmail.com';")
    user = cursor.fetchone()
    
    if user:
        print(f"User ID: {user[0]}")
        print(f"Email: {user[1]}")
        print(f"Role: {user[2]}")
        print(f"Org ID: {user[3]}")
    else:
        print("User not found.")
        
    conn.close()
else:
    print("Database not found.")
