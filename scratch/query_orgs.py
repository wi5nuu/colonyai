import sqlite3

def query_orgs():
    conn = sqlite3.connect("d:/lombapuai/backend/colonyai.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, is_active, location FROM organizations LIMIT 50")
    orgs = cursor.fetchall()
    
    with open("d:/lombapuai/scratch/orgs_log.txt", "w", encoding="utf-8") as f:
        f.write("Organizations in DB:\n")
        for o in orgs:
            f.write(f"- ID: {o[0]} | Name: {o[1]} | is_active: {o[2]} (type: {type(o[2])}) | Location: {o[3]}\n")
            
    conn.close()

if __name__ == "__main__":
    query_orgs()
