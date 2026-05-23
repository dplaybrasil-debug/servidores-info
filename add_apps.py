import sqlite3

db_path = 'database.sqlite'
apps_to_add = [
    "PLAY BOX", "BIG PLAYER", "QUICK PLAYER", "QPLAYER", "QUICK PRO"
]

# Clean names
apps_to_add = [name.strip() for name in apps_to_add if name.strip()]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing apps
cursor.execute("SELECT name FROM partner_apps")
existing_apps = {row[0].strip().lower() for row in cursor.fetchall()}

added_count = 0
for app_name in apps_to_add:
    if app_name.lower() not in existing_apps:
        cursor.execute("INSERT INTO partner_apps (name, url, logo, status) VALUES (?, ?, ?, ?)",
                       (app_name, "", "", "active"))
        added_count += 1
        existing_apps.add(app_name.lower())

conn.commit()
conn.close()

print(f"Added {added_count} apps successfully.")
