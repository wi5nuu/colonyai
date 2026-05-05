import sqlite3
import os

db_path = "d:/lombapuai/backend/colonyai.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, sample_id, organization_id, user_id FROM analyses LIMIT 10;")
    rows = cursor.fetchall()
    
    print("ANALYSES TABLE:")
    for row in rows:
        print(f"ID: {row[0]}, Sample: {row[1]}, Org: {row[2]}, User: {row[3]}")
        
    conn.close()
else:
    print("Database not found.")
