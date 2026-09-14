<?php
// router.php - Roteador amigável para o Servidor PHP Local (php -S localhost:8000)

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl  = parse_url($requestUri);
$path       = $parsedUrl['path'] ?? '/';
$decodedPath = rawurldecode($path);

// Se for um arquivo real existente no sistema de arquivos (CSS, JS, imagens, api.php, etc.), serve diretamente
$filePath = __DIR__ . $decodedPath;
if ($path !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}

// Raiz
if ($path === '/' || $path === '/index.html') {
    require __DIR__ . '/index.html';
    exit;
}

// Admin
if ($path === '/admin' || $path === '/admin.php') {
    require __DIR__ . '/admin.php';
    exit;
}

// Server.html direto
if ($path === '/server.html') {
    require __DIR__ . '/server.html';
    exit;
}

// Rota de Servidor Amigável (ex: /adam-play, /br-pro-vip ou /nome-do-servidor)
$slug = trim($decodedPath, '/');
if (!empty($slug)) {
    $_GET['slug'] = urldecode($slug);
    require __DIR__ . '/server.html';
    exit;
}

return false;
