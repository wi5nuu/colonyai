import sqlite3
import os

db_path = r"D:\lombapuai\backend\colonyai.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM users;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Email: {row[0]}, Role: {row[1]}")
    conn.close()
