import sqlite3
from argon2 import PasswordHasher

def reset_super_admin():
    conn = sqlite3.connect("d:/lombapuai/backend/colonyai.db")
    cursor = conn.cursor()
    
    ph = PasswordHasher()
    new_password = "WisnuSuper2026!"
    hashed = ph.hash(new_password)
    
    with open("d:/lombapuai/scratch/reset_log.txt", "w", encoding="utf-8") as f:
        try:
            # SQLite role column is Case-Sensitive and stores in ALL CAPS ('SUPER_ADMIN')
            cursor.execute("SELECT id, email, full_name, role FROM users WHERE role = 'SUPER_ADMIN'")
            users = cursor.fetchall()
            f.write("Found super admins:\n")
            for u in users:
                f.write(f"- ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | Role: {u[3]}\n")
                
            # Update passwords for SUPER_ADMIN role (all caps)
            cursor.execute("UPDATE users SET password_hash = ? WHERE role = 'SUPER_ADMIN'", (hashed,))
            conn.commit()
            f.write(f"Successfully reset passwords for all SUPER_ADMIN users to: {new_password}\n")
            
            # Also update admin@colonyai.com
            cursor.execute("SELECT id, email, role FROM users WHERE email = 'admin@colonyai.com'")
            admin = cursor.fetchone()
            if admin:
                f.write(f"Found admin: {admin[1]} | Role: {admin[2]}\n")
                cursor.execute("UPDATE users SET password_hash = ? WHERE email = 'admin@colonyai.com'", (hashed,))
                conn.commit()
                f.write(f"Successfully reset password for admin@colonyai.com to: {new_password}\n")
                
        except Exception as e:
            f.write(f"Error during reset: {e}\n")
        finally:
            conn.close()

if __name__ == "__main__":
    reset_super_admin()
