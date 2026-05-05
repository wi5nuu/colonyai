import sqlite3
import os
import secrets
from datetime import datetime, timedelta

db_path = "d:/lombapuai/backend/colonyai.db"
email = "wisnu.ashar@gmail.com"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Find the latest pending request for this email
    cursor.execute("""
        SELECT pr.id, u.id 
        FROM password_reset_requests pr
        JOIN users u ON pr.user_id = u.id
        WHERE u.email = ? AND pr.status = 'pending'
        ORDER BY pr.requested_at DESC LIMIT 1;
    """, (email,))
    
    row = cursor.fetchone()
    
    if row:
        request_id, user_id = row
        # Generate a secure token
        token = secrets.token_urlsafe(48)
        expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        
        # Approve the request and set the token
        cursor.execute("""
            UPDATE password_reset_requests 
            SET status = 'approved', reset_token = ?, expires_at = ?, reviewed_at = ?
            WHERE id = ?;
        """, (token, expires_at, datetime.utcnow().isoformat(), request_id))
        
        # Also update the user record if necessary (some systems store it there too)
        cursor.execute("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?;", (token, expires_at, user_id))
        
        conn.commit()
        print(f"TOKEN_GENERATED: {token}")
    else:
        print("No pending request found for this email.")
        
    conn.close()
else:
    print("Database not found.")
