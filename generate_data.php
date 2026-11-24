<?php
/**
 * generate_data.php
 * Gera os arquivos data.js e data.json com TODOS os dados estáticos do banco SQLite
 * e atualiza automaticamente os parâmetros de versão anti-cache em index.html e server.html.
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

// Oculta links sensíveis (painel, loja, url externa) do arquivo público data.js/data.json
foreach ($servers as &$s) {
    unset($s['panel_url'], $s['app_store_url'], $s['url']);
}
unset($s);

foreach ($apps as &$a) {
    unset($a['url']);
}
unset($a);

$generated_at = date('Y-m-d H:i:s');
$version      = date('Ymd_His');

$dataArray = [
    'version'      => $version,
    'generated_at' => $generated_at,
    'servers'      => $servers,
    'apps'         => $apps,
    'contacts'     => $contacts,
    'server_apps'  => $server_apps,
    'plans'        => $plans
];

$jsonData = json_encode($dataArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// 1. Salva data.json
file_put_contents(__DIR__ . '/data.json', $jsonData);

// 2. Salva data.js
$jsContent = <<<JS
/**
 * data.js — Dados estáticos exportados automaticamente.
 * Gerado em: {$generated_at}
 * NÃO edite manualmente. Regenere via: php generate_data.php
 */
window.STATIC_DATA = {$jsonData};
JS;
file_put_contents(__DIR__ . '/data.js', $jsContent);

// 3. Atualiza a versão anti-cache nos arquivos HTML
foreach (['index.html', 'server.html'] as $file) {
    $filePath = __DIR__ . '/' . $file;
    if (file_exists($filePath)) {
        $html = file_get_contents($filePath);
        $html = preg_replace('/((?:data\.js|portal\.js|style\.css)\?v=)[^"\'\s>]+/i', '${1}' . $version, $html);
        file_put_contents($filePath, $html);
    }
}

echo "✅ data.js e data.json gerados com sucesso! (Versão: {$version})\n";
echo "   " . count($servers) . " servidores\n";
echo "   " . count($apps) . " apps\n";
echo "   " . count($contacts) . " contatos\n";
echo "   " . count($server_apps) . " vínculos servidor-app\n";
echo "   " . count($plans) . " planos\n";
echo "   Arquivos index.html e server.html sincronizados com a versão {$version}!\n";
