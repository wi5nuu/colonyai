import sqlite3
import os

db_path = "d:/lombapuai/backend/colonyai.db"
target_user_id = "8cd14668-9032-4d77-8f22-1a49fbf62e39"
target_org_id = "19f89249-45cc-4df4-8870-622db325ed8d"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Migrate all analyses to the target user and organization
    cursor.execute(f"UPDATE analyses SET user_id = '{target_user_id}', organization_id = '{target_org_id}';")
    
    conn.commit()
    print(f"Successfully migrated {conn.total_changes} analyses to User: {target_user_id} and Org: {target_org_id}")
    conn.close()
else:
    print("Database not found.")
