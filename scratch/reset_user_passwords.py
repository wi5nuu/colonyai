import sqlite3
import uuid
from argon2 import PasswordHasher

def reset_users():
    db_path = "d:/lombapuai/backend/colonyai.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    ph = PasswordHasher()
    password = "Colony2026!"
    hashed = ph.hash(password)
    
    # We will ensure both gmail.com and colonyai.com variants exist and are set up
    users_to_ensure = [
        # (email, full_name)
        ("wisnualfian117@gmail.com", "Wisnu Alfian Nur Ashar"),
        ("suci@gmail.com", "Suci Master (Gmail)"),
        ("suci@colonyai.com", "Suci Master"),
        ("mujahid@gmail.com", "Mujahid Master"),
        ("mujahid@colonyai.com", "Mujahid Master (Colony)"),
        ("steven@gmail.com", "Steven Master (Gmail)"),
        ("steven@colonyai.com", "Steven Master")
    ]
    
    print("=== ColonyAI Super Admin Registry & Password Reset ===")
    
    for email, full_name in users_to_ensure:
        cursor.execute("SELECT id, email, role FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if user:
            user_id = user[0]
            print(f"[UPDATE] Found existing user: {email} | Current Role: {user[2]}")
            # Update password, role to SUPER_ADMIN, active status, reset failed attempts
            cursor.execute("""
                UPDATE users 
                SET password_hash = ?, 
                    role = 'SUPER_ADMIN', 
                    recovery_password = ?,
                    failed_login_attempts = 0,
                    is_active = 1,
                    is_locked_out = 'no'
                WHERE id = ?
            """, (hashed, password, user_id))
            print(f"         Successfully reset password to '{password}' and set role to SUPER_ADMIN.")
        else:
            new_id = str(uuid.uuid4())
            print(f"[INSERT] User not found: {email}. Creating new SUPER_ADMIN...")
            # Insert new SUPER_ADMIN user
            cursor.execute("""
                INSERT INTO users (
                    id, organization_id, email, password_hash, full_name, role, 
                    laboratory_id, reset_token, reset_token_expires, recovery_password,
                    failed_login_attempts, last_failed_login, is_locked_out, is_active,
                    mfa_code, mfa_expires, trusted_devices, created_at, updated_at
                ) VALUES (
                    ?, NULL, ?, ?, ?, 'SUPER_ADMIN',
                    NULL, NULL, NULL, ?,
                    0, NULL, 'no', 1,
                    NULL, NULL, '[]', datetime('now'), datetime('now')
                )
            """, (new_id, email, hashed, full_name, password))
            print(f"         Successfully created user with ID: {new_id} and password: {password}")
            
    conn.commit()
    conn.close()
    print("======================================================")
    print("All tasks completed successfully!")

if __name__ == "__main__":
    reset_users()
