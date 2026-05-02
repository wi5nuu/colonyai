
import asyncio
import sqlite3
import os

db_path = r'd:\lombapuai\backend\colonyai.db'

def inspect_orgs():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    print("--- Organizations Status Inspection ---")
    cursor.execute("SELECT id, name, is_active FROM organizations")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Status: {row[2]} (Type: {type(row[2])})")
    conn.close()

if __name__ == "__main__":
    inspect_orgs()
