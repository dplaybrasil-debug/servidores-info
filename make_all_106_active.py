import sqlite3, os, json, subprocess, shutil

db_paths = [
    r"C:\Users\dimil\Downloads\Central-de-Servidores\database.sqlite",
    r"C:\Users\dimil\Downloads\Central-de-Servidores-VALIDADO\database.sqlite",
    r"c:\Users\dimil\OneDrive\Documentos\Antigravity\Servidores Info\database.sqlite"
]

print("=== SETTING ALL SERVERS STATUS TO ACTIVE ===")

for db_path in db_paths:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("UPDATE servers SET status = 'active';")
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM servers WHERE status = 'active';")
        cnt = cur.fetchone()[0]
        print(f"Updated {db_path}: {cnt} active servers")
        conn.close()

# Generate new data.js with ALL 106 active servers
target_dir = r"C:\Users\dimil\Downloads\Central-de-Servidores"
serv_info_dir = r"c:\Users\dimil\OneDrive\Documentos\Antigravity\Servidores Info"

conn = sqlite3.connect(os.path.join(target_dir, "database.sqlite"))
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT * FROM servers WHERE status = 'active' ORDER BY name ASC;")
servers = [dict(r) for r in cur.fetchall()]

try:
    cur.execute("SELECT * FROM partner_apps ORDER BY name ASC;")
    apps = [dict(r) for r in cur.fetchall()]
except:
    apps = []

try:
    cur.execute("SELECT * FROM support_contacts ORDER BY id ASC;")
    contacts = [dict(r) for r in cur.fetchall()]
except:
    contacts = []

try:
    cur.execute("SELECT * FROM server_apps;")
    links = [dict(r) for r in cur.fetchall()]
except:
    links = []

conn.close()

data_js_content = f"""/**
 * data.js — Dados estáticos exportados automaticamente.
 * Gerado em: {json.dumps(servers, indent=2, ensure_ascii=False)}
 */
window.STATIC_DATA = {{
    servers:  {json.dumps(servers, indent=2, ensure_ascii=False)},
    apps:     {json.dumps(apps, indent=2, ensure_ascii=False)},
    contacts: {json.dumps(contacts, indent=2, ensure_ascii=False)},
    links:    {json.dumps(links, indent=2, ensure_ascii=False)}
}};
"""

with open(os.path.join(target_dir, "data.js"), "w", encoding="utf-8") as f:
    f.write(data_js_content)

with open(os.path.join(serv_info_dir, "data.js"), "w", encoding="utf-8") as f:
    f.write(data_js_content)

print(f"\nGenerated data.js with ALL {len(servers)} active servers!")

# Commit and Push to GitHub
print("\n=== STAGING AND COMMITTING TO GITHUB ===")
subprocess.run(["git", "add", "-f", "database.sqlite"], cwd=target_dir)
subprocess.run(["git", "add", "-f", "data.js"], cwd=target_dir)
subprocess.run(["git", "add", "."], cwd=target_dir)

commit_res = subprocess.run(["git", "commit", "-m", "fix: ativar todos os 106 servidores no banco sqlite e data.js"], cwd=target_dir, capture_output=True, text=True)
print("COMMIT STDOUT:", commit_res.stdout)

print("\n=== PUSHING TO GITHUB (origin/main) ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=target_dir, capture_output=True, text=True)
print("PUSH STDOUT:", push_res.stdout)
print("PUSH STDERR:", push_res.stderr)
