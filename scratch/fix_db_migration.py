import sqlite3
import os

# Robust path detection
possible_paths = [
    os.path.join("backend", "colonyai.db"),     # From Project Root
    "colonyai.db",                              # From backend/
    os.path.join("..", "backend", "colonyai.db"), # From other subfolders
    os.path.join("backend", "sql_app.db"),     # Fallback
    "sql_app.db"                               # Fallback
]

db_path = None
for p in possible_paths:
    if os.path.exists(p):
        db_path = p
        break

def migrate():
    if not db_path:
        print(f"CRITICAL: Database 'sql_app.db' not found in any expected location.")
        print(f"Current working directory: {os.getcwd()}")
        return

    print(f"Found database at: {os.path.abspath(db_path)}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("Checking for missing columns in 'organizations' table...")
        cursor.execute("PRAGMA table_info(organizations)")
        columns = [column[1] for column in cursor.fetchall()]

        if "lims_webhook_url" not in columns:
            print("Adding 'lims_webhook_url' to 'organizations' table...")
            cursor.execute("ALTER TABLE organizations ADD COLUMN lims_webhook_url TEXT")
            conn.commit()
            print("Successfully added 'lims_webhook_url' column.")
        else:
            print("Column 'lims_webhook_url' already exists.")

    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
