#!/usr/bin/env python
"""
Fix: Buat organization_id nullable di tabel analyses
SQLite tidak support ALTER COLUMN, jadi kita recreate tabel
"""
import sqlite3
import os

db_path = r'D:\lombapuai\backend\colonyai.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Cek struktur tabel analyses
    cursor.execute("PRAGMA table_info(analyses)")
    cols = cursor.fetchall()
    print("Kolom analyses:")
    for c in cols:
        print(f"  {c[1]:30s} notnull={c[3]}")

    # Cek apakah organization_id NOT NULL
    org_col = next((c for c in cols if c[1] == 'organization_id'), None)
    if org_col:
        print(f"\norganization_id notnull={org_col[3]}")
        if org_col[3] == 1:
            print("PERLU FIX: organization_id masih NOT NULL")
            print("Jalankan recreate_db.py untuk fix ini")
        else:
            print("OK: organization_id sudah nullable")

    # Cek user tanpa organization_id
    cursor.execute("SELECT id, email, organization_id FROM users LIMIT 10")
    users = cursor.fetchall()
    print("\nUsers:")
    for u in users:
        print(f"  {u[1]:30s} org_id={u[2]}")

    # Cek organizations
    cursor.execute("SELECT id, name FROM organizations LIMIT 5")
    orgs = cursor.fetchall()
    print("\nOrganizations:")
    for o in orgs:
        print(f"  {o[0][:8]}... {o[1]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
