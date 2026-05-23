<?php
header('Content-Type: application/json');
require 'db.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // --- SERVIDORES ---
    if ($action === 'update_server') {
        $stmt = $pdo->prepare("UPDATE servers SET name = ?, url = ?, logo = ?, status = ?, description = ?, table_image_url = ?, screens = ?, panel_url = ?, app_store_url = ?, server_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$data['name'], $data['url'], $data['logo'] ?? '', $data['status'], $data['description'], $data['table_image_url'] ?? '', $data['screens'] ?? 1, $data['panel_url'] ?? '', $data['app_store_url'] ?? '', $data['server_type'] ?? 'hybrid', $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'create_server') {
        $stmt = $pdo->prepare("INSERT INTO servers (name, url, logo, status, description, table_image_url, screens, panel_url, app_store_url, server_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['url'], $data['logo'] ?? '', $data['status'], $data['description'], $data['table_image_url'] ?? '', $data['screens'] ?? 1, $data['panel_url'] ?? '', $data['app_store_url'] ?? '', $data['server_type'] ?? 'hybrid']);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }
    
    if ($action === 'delete_server') {
        $stmt = $pdo->prepare("DELETE FROM servers WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'update_content') {
        $stmt = $pdo->prepare("UPDATE servers SET movies = ?, series = ?, channels = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$data['movies'], $data['series'], $data['channels'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'toggle_server_status') {
        $stmt = $pdo->prepare("UPDATE servers SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    // --- PLANOS ---
    if ($action === 'create_plan') {
        $stmt = $pdo->prepare("INSERT INTO server_plans (server_id, name, screens, price) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['server_id'], $data['name'], $data['screens'], $data['price']]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'delete_plan') {
        $stmt = $pdo->prepare("DELETE FROM server_plans WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    // --- VINCULAÇÃO DE APPS ---
    if ($action === 'update_server_apps') {
        $serverId = $data['server_id'];
        $appIds = $data['app_ids'] ?? [];
        
        // Remove associações antigas
        $stmt = $pdo->prepare("DELETE FROM server_apps WHERE server_id = ?");
        $stmt->execute([$serverId]);
        
        // Insere as novas associações
        if(count($appIds) > 0) {
            $stmt = $pdo->prepare("INSERT INTO server_apps (server_id, app_id) VALUES (?, ?)");
            foreach($appIds as $appId) {
                $stmt->execute([$serverId, $appId]);
            }
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // --- APPS PARCEIROS ---
    if ($action === 'update_app') {
        $stmt = $pdo->prepare("UPDATE partner_apps SET name = ?, url = ?, logo = ?, status = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['url'], $data['logo'] ?? '', $data['status'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'create_app') {
        $stmt = $pdo->prepare("INSERT INTO partner_apps (name, url, logo, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['url'], $data['logo'], $data['status']]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'delete_app') {
        $stmt = $pdo->prepare("DELETE FROM partner_apps WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'toggle_app_status') {
        $stmt = $pdo->prepare("UPDATE partner_apps SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    // --- CONTATOS DE APOIO ---
    if ($action === 'create_contact') {
        $stmt = $pdo->prepare("INSERT INTO support_contacts (name, type, value, description, active, sort_order) VALUES (?, ?, ?, ?, 1, ?)");
        $stmt->execute([$data['name'], $data['type'], $data['value'], $data['description'] ?? '', $data['sort_order'] ?? 0]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'update_contact') {
        $stmt = $pdo->prepare("UPDATE support_contacts SET name = ?, type = ?, value = ?, description = ?, sort_order = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['type'], $data['value'], $data['description'] ?? '', $data['sort_order'] ?? 0, $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete_contact') {
        $stmt = $pdo->prepare("DELETE FROM support_contacts WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'toggle_contact_active') {
        $stmt = $pdo->prepare("UPDATE support_contacts SET active = ? WHERE id = ?");
        $stmt->execute([$data['active'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list_servers') {
        $stmt = $pdo->query("SELECT * FROM servers ORDER BY name ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    if ($action === 'list_plans') {
        $serverId = $_GET['server_id'] ?? 0;
        $stmt = $pdo->prepare("SELECT * FROM server_plans WHERE server_id = ? ORDER BY id ASC");
        $stmt->execute([$serverId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    if ($action === 'list_apps') {
        $stmt = $pdo->query("SELECT * FROM partner_apps ORDER BY name ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    
    // Rota pública para buscar 1 servidor e seus planos pelo ID
    if ($action === 'get_server_details') {
        $id = $_GET['id'] ?? 0;
        $stmtSrv = $pdo->prepare("SELECT * FROM servers WHERE id = ?");
        $stmtSrv->execute([$id]);
        $server = $stmtSrv->fetch(PDO::FETCH_ASSOC);
        
        if($server) {
            $stmtPlans = $pdo->prepare("SELECT * FROM server_plans WHERE server_id = ?");
            $stmtPlans->execute([$id]);
            $server['plans'] = $stmtPlans->fetchAll(PDO::FETCH_ASSOC);
            
            // Busca Apps vinculados
            $stmtApps = $pdo->prepare("SELECT a.id, a.name, a.logo FROM partner_apps a INNER JOIN server_apps sa ON a.id = sa.app_id WHERE sa.server_id = ? AND a.status = 'active' ORDER BY a.name ASC");
            $stmtApps->execute([$id]);
            $server['linked_apps'] = $stmtApps->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($server);
        } else {
            echo json_encode(['error' => 'Not found']);
        }
        exit;
    }
    
    // Rota pública para buscar 1 app e seus servidores vinculados pelo ID
    if ($action === 'get_app_details') {
        $id = $_GET['id'] ?? 0;
        $stmtApp = $pdo->prepare("SELECT * FROM partner_apps WHERE id = ?");
        $stmtApp->execute([$id]);
        $app = $stmtApp->fetch(PDO::FETCH_ASSOC);
        
        if($app) {
            // Busca Servidores vinculados
            $stmtSrv = $pdo->prepare("SELECT s.id, s.name, s.logo FROM servers s INNER JOIN server_apps sa ON s.id = sa.server_id WHERE sa.app_id = ? AND s.status = 'active' ORDER BY s.name ASC");
            $stmtSrv->execute([$id]);
            $app['linked_servers'] = $stmtSrv->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($app);
        } else {
            echo json_encode(['error' => 'Not found']);
        }
        exit;
    }
    
    // Buscar quais IDs de apps o servidor tem marcado
    if ($action === 'get_server_apps') {
        $serverId = $_GET['server_id'] ?? 0;
        $stmt = $pdo->prepare("SELECT app_id FROM server_apps WHERE server_id = ?");
        $stmt->execute([$serverId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
        exit;
    }

    // Listar contatos de apoio (público)
    if ($action === 'list_contacts') {
        $onlyActive = ($_GET['active_only'] ?? '1') === '1';
        if ($onlyActive) {
            $stmt = $pdo->query("SELECT * FROM support_contacts WHERE active = 1 ORDER BY sort_order ASC, id ASC");
        } else {
            $stmt = $pdo->query("SELECT * FROM support_contacts ORDER BY sort_order ASC, id ASC");
        }
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
}

echo json_encode(['error' => 'Invalid action']);
?>
