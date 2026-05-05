#!/usr/bin/env python
"""
Fix: ubah organization_id di tabel analyses menjadi nullable
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'colonyai.db')

print(f"Database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Cek struktur tabel saat ini
cursor.execute("PRAGMA table_info(analyses)")
columns = cursor.fetchall()
print("\nKolom tabel analyses:")
for col in columns:
    print(f"  {col[1]:30s} | nullable={not col[3]} | default={col[4]}")

# SQLite tidak support ALTER COLUMN, perlu recreate table
# Tapi cara termudah: cek apakah ada user tanpa org_id

cursor.execute("SELECT id, organization_id FROM users LIMIT 5")
users = cursor.fetchall()
print("\nUsers:")
for u in users:
    print(f"  id={u[0][:8]}... org_id={u[1]}")

# Cek organizations
cursor.execute("SELECT id, name FROM organizations LIMIT 5")
orgs = cursor.fetchall()
print("\nOrganizations:")
for o in orgs:
    print(f"  id={o[0][:8]}... name={o[1]}")

conn.close()
print("\nDone!")
