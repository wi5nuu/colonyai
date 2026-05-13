import sqlite3
import os

db_path = os.path.join("backend", "colonyai.db")

def audit():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check organizations table
        print("--- Table: organizations ---")
        cursor.execute("PRAGMA table_info(organizations)")
        cols = [c[1] for c in cursor.fetchall()]
        print(f"Columns: {cols}")
        
        needed_org_cols = ["lims_webhook_url", "institution_type", "compliance_standard", "infra_config"]
        for col in needed_org_cols:
            if col not in cols:
                print(f"MISSING in organizations: {col}")
                cursor.execute(f"ALTER TABLE organizations ADD COLUMN {col} TEXT")
                print(f"Added {col}")

        # Check analyses table
        print("\n--- Table: analyses ---")
        cursor.execute("PRAGMA table_info(analyses)")
        cols = [c[1] for c in cursor.fetchall()]
        
        needed_analysis_cols = ["cfu_status", "cfu_message", "uncertainty_u", "merged_estimation_method"]
        for col in needed_analysis_cols:
            if col not in cols:
                print(f"MISSING in analyses: {col}")
                cursor.execute(f"ALTER TABLE analyses ADD COLUMN {col} TEXT")
                print(f"Added {col}")

        conn.commit()
        print("\nAudit and Auto-Fix Complete.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    audit()
