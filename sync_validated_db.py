import sqlite3, os, shutil, subprocess

valid_dir = r"C:\Users\dimil\Downloads\Central-de-Servidores-VALIDADO"
target_dir = r"C:\Users\dimil\Downloads\Central-de-Servidores"
serv_info_dir = r"c:\Users\dimil\OneDrive\Documentos\Antigravity\Servidores Info"

print("=== SYNCING VALIDATED DATABASE & DATA.JS ===")

# Copy database.sqlite and data.js
src_db = os.path.join(valid_dir, "database.sqlite")
src_data_js = os.path.join(valid_dir, "data.js")

shutil.copy2(src_db, os.path.join(target_dir, "database.sqlite"))
shutil.copy2(src_data_js, os.path.join(target_dir, "data.js"))

shutil.copy2(src_db, os.path.join(serv_info_dir, "database.sqlite"))
shutil.copy2(src_data_js, os.path.join(serv_info_dir, "data.js"))

print("Files copied successfully!")

# Verify count of servers in target database
conn = sqlite3.connect(os.path.join(target_dir, "database.sqlite"))
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM servers;")
srv_count = cur.fetchone()[0]
print(f"Verified target database.sqlite server count: {srv_count}")
conn.close()

# Force add database.sqlite and data.js to git and commit & push
print("\n=== FORCE STAGING database.sqlite AND data.js TO GIT ===")
subprocess.run(["git", "add", "-f", "database.sqlite"], cwd=target_dir)
subprocess.run(["git", "add", "-f", "data.js"], cwd=target_dir)
subprocess.run(["git", "add", "."], cwd=target_dir)

print("\n=== COMMITTING UPDATED DATABASE WITH 106 SERVERS ===")
commit_res = subprocess.run(["git", "commit", "-m", "feat: atualizar banco de dados sqlite com 106 servidores e data.js completo"], cwd=target_dir, capture_output=True, text=True)
print("COMMIT STDOUT:", commit_res.stdout)
print("COMMIT STDERR:", commit_res.stderr)

print("\n=== PUSHING TO GITHUB (origin/main) ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=target_dir, capture_output=True, text=True)
print("PUSH STDOUT:", push_res.stdout)
print("PUSH STDERR:", push_res.stderr)
