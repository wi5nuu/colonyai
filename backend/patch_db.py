import sqlite3
import os

db_path = r'd:\lombapuai\backend\colonyai.db'

def patch_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Add is_active column to users table
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
            print("Successfully added 'is_active' column to users table.")
        except sqlite3.OperationalError:
            print("Column 'is_active' already exists or users table missing.")

        # 2. Create notifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            organization_id CHAR(36),
            type VARCHAR(50) NOT NULL DEFAULT 'info',
            notification_type VARCHAR(50) NOT NULL DEFAULT 'info',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            link VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        print("Ensured 'notifications' table exists.")

        # 3. Create password_reset_requests table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_requests (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            organization_id CHAR(36),
            requester_ip VARCHAR(64),
            requester_ua VARCHAR(512),
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            reviewed_at DATETIME,
            reviewed_by CHAR(36),
            reset_token VARCHAR(255) UNIQUE,
            token_expires_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        print("Ensured 'password_reset_requests' table exists.")
        
        conn.commit()
    except Exception as e:
        print(f"Error during patching: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    patch_db()
