import sqlite3
import os

def patch_database():
    db_path = 'colonyai.db'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ('mfa_code', 'VARCHAR(6)'),
        ('mfa_expires', 'DATETIME'),
        ('trusted_devices', 'JSON')
    ]

    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Database patching complete.")

if __name__ == "__main__":
    patch_database()
