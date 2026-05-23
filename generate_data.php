<?php
/**
 * generate_data.php
 * Gera o arquivo data.js com TODOS os dados estáticos do banco SQLite.
 * Uso: .\php\php.exe generate_data.php
 */
$pdo = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Servidores ativos
$servers = $pdo->query("SELECT * FROM servers WHERE status = 'active' ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

// Apps ativos
$apps = $pdo->query("SELECT * FROM partner_apps WHERE status = 'active' ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

// Contatos ativos
$contacts = [];
try {
    $contacts = $pdo->query("SELECT * FROM support_contacts WHERE active = 1 ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

// Vínculos Servidor <-> App
$server_apps = [];
try {
    $server_apps = $pdo->query("SELECT server_id, app_id FROM server_apps")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

// Planos dos Servidores
$plans = [];
try {
    $plans = $pdo->query("SELECT * FROM server_plans ORDER BY server_id ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

// Monta o arquivo JS estático
$json_servers     = json_encode($servers,     JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_apps        = json_encode($apps,        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_contacts    = json_encode($contacts,    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_server_apps = json_encode($server_apps, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_plans       = json_encode($plans,       JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$generated_at     = date('Y-m-d H:i:s');

$content = <<<JS
/**
 * data.js — Dados estáticos exportados automaticamente.
 * Gerado em: {$generated_at}
 * NÃO edite manualmente. Regenere via: php generate_data.php
 */
window.STATIC_DATA = {
    servers:     {$json_servers},
    apps:        {$json_apps},
    contacts:    {$json_contacts},
    server_apps: {$json_server_apps},
    plans:       {$json_plans}
};
JS;

$output_path = __DIR__ . '/data.js';
file_put_contents($output_path, $content);

echo "✅ data.js gerado com sucesso!\n";
echo "   " . count($servers) . " servidores\n";
echo "   " . count($apps) . " apps\n";
echo "   " . count($contacts) . " contatos\n";
echo "   " . count($server_apps) . " vínculos servidor-app\n";
echo "   " . count($plans) . " planos\n";
