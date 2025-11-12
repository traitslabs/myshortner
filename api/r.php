<?php
$slug = trim($_SERVER['PATH_INFO'] ?? '', '/');
if (!preg_match('/^[A-Z0-9]{6}$/', $slug)) { http_response_code(404); die("404"); }

$links = json_decode(file_get_contents("links.json"), true) ?: [];
if (!isset($links[$slug])) { http_response_code(404); die("404"); }

$dest = $links[$slug]['url'];
$ua = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');

if (strpos($ua, 'facebook') !== false || strpos($ua, 'facebot') !== false || strpos($ua, 'twitterbot') !== false) {
    echo '<!DOCTYPE html><html><head>
        <meta property="og:title" content="Short Link">
        <meta property="og:url" content="https://link.mvr.cam/' . $slug . '">
        <title>Ready</title>
        <style>body{background:#fff;color:#333;text-align:center;padding:60px;font-family:Segoe UI;}
        h1{color:#007bff;}</style>
    </head><body><h1>Link is Ready!</h1></body></html>';
    exit;
}

header("Location: $dest");
exit;
?>