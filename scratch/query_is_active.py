import sqlite3

def query_is_active():
    conn = sqlite3.connect("d:/lombapuai/backend/colonyai.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, is_active, typeof(is_active) FROM organizations")
    rows = cursor.fetchall()
    
    with open("d:/lombapuai/scratch/is_active_log.txt", "w", encoding="utf-8") as f:
        f.write("All Organizations is_active values:\n")
        for r in rows:
            f.write(f"- Name: {r[1]} | is_active: {repr(r[2])} | DB Type: {r[3]}\n")
            
    conn.close()

if __name__ == "__main__":
    query_is_active()
