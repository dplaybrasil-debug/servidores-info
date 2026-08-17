<?php
/**
 * export_data.php
 * Gera o arquivo data.js com todos os dados estáticos do banco.
 * Acesse: http://localhost:8000/export_data.php
 */
require_once 'db.php';

$pdo = getDB();

// Servidores ativos
$servers = $pdo->query("SELECT * FROM servers WHERE status = 'active' ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

// Apps ativos
$apps = $pdo->query("SELECT * FROM apps WHERE status = 'active' ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

// Contatos
$contacts = [];
try {
    $contacts = $pdo->query("SELECT * FROM contacts ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { /* tabela pode não existir */ }

// Vínculos app-servidor
$links = [];
try {
    $links = $pdo->query("SELECT * FROM app_server_links")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

// Monta o arquivo JS estático
$json_servers  = json_encode($servers,  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_apps     = json_encode($apps,     JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_contacts = json_encode($contacts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$json_links    = json_encode($links,    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$generated_at  = date('Y-m-d H:i:s');

$content = <<<JS
/**
 * data.js — Dados estáticos exportados automaticamente.
 * Gerado em: {$generated_at}
 * NÃO edite manualmente. Regenere via: http://localhost:8000/export_data.php
 */
window.STATIC_DATA = {
    servers:  {$json_servers},
    apps:     {$json_apps},
    contacts: {$json_contacts},
    links:    {$json_links}
};
JS;

// Salva o arquivo
$output_path = __DIR__ . '/data.js';
file_put_contents($output_path, $content);

echo "<h2>✅ data.js gerado com sucesso!</h2>";
echo "<p><strong>" . count($servers) . "</strong> servidores</p>";
echo "<p><strong>" . count($apps) . "</strong> apps</p>";
echo "<p><strong>" . count($contacts) . "</strong> contatos</p>";
echo "<p>Arquivo salvo em: <code>data.js</code></p>";
echo "<hr>";
echo "<p>Agora execute no PowerShell:</p>";
echo "<pre>cd \"C:\\Users\\dimil\\Downloads\\Servidores e App Parceiros\"
git add .
git commit -m \"update: dados estáticos atualizados\"
git push origin main</pre>";
