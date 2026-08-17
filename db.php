<?php
$db_file = __DIR__ . '/database.sqlite';
$is_new = !file_exists($db_file);

try {
    $pdo = new PDO('sqlite:' . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Tabela Servidores
    $pdo->exec("CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        logo TEXT,
        description TEXT,
        movies INTEGER DEFAULT 0,
        series INTEGER DEFAULT 0,
        channels INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabela Apps Parceiros
    $pdo->exec("CREATE TABLE IF NOT EXISTS partner_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        logo TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabela Planos dos Servidores
    $pdo->exec("CREATE TABLE IF NOT EXISTS server_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        screens TEXT NOT NULL,
        price TEXT NOT NULL,
        FOREIGN KEY(server_id) REFERENCES servers(id) ON DELETE CASCADE
    )");

    // Tabela de Vínculo: Servidores <-> Apps Parceiros
    $pdo->exec("CREATE TABLE IF NOT EXISTS server_apps (
        server_id INTEGER NOT NULL,
        app_id INTEGER NOT NULL,
        PRIMARY KEY(server_id, app_id),
        FOREIGN KEY(server_id) REFERENCES servers(id) ON DELETE CASCADE,
        FOREIGN KEY(app_id) REFERENCES partner_apps(id) ON DELETE CASCADE
    )");

    // Tabela de Contatos de Apoio
    $pdo->exec("CREATE TABLE IF NOT EXISTS support_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'whatsapp',
        value TEXT NOT NULL,
        description TEXT,
        active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Atualiza tabela antiga caso já exista, para adicionar colunas de conteúdos
    if (!$is_new) {
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN movies INTEGER DEFAULT 0;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN series INTEGER DEFAULT 0;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN channels INTEGER DEFAULT 0;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN logo TEXT;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN updated_at DATETIME;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN table_image_url TEXT;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN screens INTEGER DEFAULT 1;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN panel_url TEXT;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN app_store_url TEXT;"); } catch(Exception $e) {}
        try { $pdo->exec("ALTER TABLE servers ADD COLUMN server_type TEXT DEFAULT 'hybrid';"); } catch(Exception $e) {}
    }

} catch (PDOException $e) {
    die("Database Connection failed: " . $e->getMessage());
}
?>
