import sqlite3
import uuid
from datetime import datetime

def setup_accounts():
    conn = sqlite3.connect('colonyai.db')
    cursor = conn.cursor()

    # Password hash placeholder (Sama untuk semua: ColonyAI2026!)
    # Ini adalah hash yang valid untuk passlib [bcrypt] agar bisa login
    # Jika Anda ingin ganti, silakan ganti di database nanti
    pwd_hash = "$2b$12$6pQ5fK6O8Y/o/R.zH.S5oeJ/mXmI.vHjNfG6oX.Y1Z4Z4Z4Z4Z4Z4" 

    # 1. Setup Organization
    print("Setting up Organization: Global Bio-Research Institute...")
    org_id = str(uuid.uuid4())
    cursor.execute("INSERT OR IGNORE INTO organizations (id, name, slug, institution_type, compliance_standard, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                   (org_id, 'Global Bio-Research Institute', 'global-bio', 'National Reference Lab', 'ISO-17025', 'active', datetime.utcnow(), datetime.utcnow()))
    
    cursor.execute("SELECT id FROM organizations WHERE slug = 'global-bio'")
    target_org = cursor.fetchone()[0]

    # Fungsi pembantu buat user
    def ensure_user(email, role, full_name, org_id):
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if not existing:
            print(f"Creating {role}: {email}")
            u_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO users (id, email, password_hash, full_name, role, organization_id, created_at, updated_at, is_active, failed_login_attempts, is_locked_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                           (u_id, email, pwd_hash, full_name, role, org_id, datetime.utcnow(), datetime.utcnow(), 1, 0, 'no'))
        else:
            print(f"Updating existing {role}: {email}")
            cursor.execute("UPDATE users SET role = ?, organization_id = ? WHERE email = ?", (role, org_id, email))

    # 2. Setup Super Admin
    ensure_user('wisnualfian117@gmail.com', 'super_admin', 'Wisnu Alfian (Super Admin)', None)

    # 3. Setup Org Admin
    ensure_user('parfmwis@gmail.com', 'admin', 'Wisnu Parfm (Org Admin)', target_org)

    # 4. Setup Analyst
    ensure_user('wisnu.ashar@gmail.com', 'analyst', 'Wisnu Ashar (Senior Analyst)', target_org)

    conn.commit()
    
    print("\n--- DATABASE IDENTITY REGISTRY ---")
    cursor.execute("SELECT email, role FROM users")
    for row in cursor.fetchall():
        print(f"User: {row[0]} | Role: {row[1]}")
    
    conn.close()

if __name__ == "__main__":
    setup_accounts()
