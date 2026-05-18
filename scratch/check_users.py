import sqlite3

def check():
    conn = sqlite3.connect("d:/lombapuai/backend/colonyai.db")
    cursor = conn.cursor()
    with open("d:/lombapuai/scratch/users.txt", "w", encoding="utf-8") as f:
        try:
            # We also retrieve recovery_password from the database!
            cursor.execute("SELECT id, email, full_name, role, password_hash, recovery_password FROM users")
            users = cursor.fetchall()
            f.write("--- Users List ---\n")
            for u in users:
                f.write(f"ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | Role: {u[3]} | Hash: {u[4]} | RecoveryPassword: {u[5]}\n")
        except Exception as e:
            f.write(f"Error reading users: {e}\n")
        finally:
            conn.close()

if __name__ == "__main__":
    check()
