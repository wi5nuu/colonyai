import sqlite3
import os

db_path = "d:/lombapuai/backend/colonyai.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update original_image_url
    cursor.execute("UPDATE analyses SET original_image_url = REPLACE(original_image_url, 'localhost', '127.0.0.1') WHERE original_image_url LIKE '%localhost%';")
    # Update annotated_image_url
    cursor.execute("UPDATE analyses SET annotated_image_url = REPLACE(annotated_image_url, 'localhost', '127.0.0.1') WHERE annotated_image_url LIKE '%localhost%';")
    
    conn.commit()
    print(f"Updated {conn.total_changes} rows.")
    conn.close()
else:
    print("Database not found.")
