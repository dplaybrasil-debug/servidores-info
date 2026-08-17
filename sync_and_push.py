import os, shutil, subprocess

src = r"c:\Users\dimil\OneDrive\Documentos\Antigravity\Servidores Info"
dst = r"C:\Users\dimil\Downloads\Central-de-Servidores"

print("=== SYNCING UPDATED CODE FILES TO REPO ===")
for root, _, files in os.walk(src):
    for f in files:
        if f.startswith('.') or 'php' in root.lower() or f.endswith(('.log', '.pyc', '.exe', '.dll')):
            continue
        rel = os.path.relpath(os.path.join(root, f), src)
        source_file = os.path.join(root, f)
        target_file = os.path.join(dst, rel)
        
        target_dir = os.path.dirname(target_file)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
            
        shutil.copy2(source_file, target_file)

print("\n=== GIT STATUS AFTER SYNC ===")
st = subprocess.run(["git", "status", "-s"], cwd=dst, capture_output=True, text=True)
print(st.stdout)

print("\n=== STAGING AND COMMITTING ===")
subprocess.run(["git", "add", "."], cwd=dst)
commit_res = subprocess.run(["git", "commit", "-m", "feat: atualizar portal de servidores, scripts e dados"], cwd=dst, capture_output=True, text=True)
print("COMMIT STDOUT:", commit_res.stdout)

print("\n=== PUSHING TO GITHUB (origin/main) ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=dst, capture_output=True, text=True)
print("PUSH STDOUT:", push_res.stdout)
print("PUSH STDERR:", push_res.stderr)
