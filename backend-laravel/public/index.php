<?php
require dirname(__DIR__) . '/bootstrap.php';

use App\Support\AppFactory;

$storage = dirname(__DIR__) . '/storage/runtime';
$app = AppFactory::make($storage);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$headers = function_exists('getallheaders') ? getallheaders() : [];
$token = '';
if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.+)/i', $headers['Authorization'], $m)) {
    $token = $m[1];
}
$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
if (!is_array($body)) {
    $body = [];
}
$body['_ip'] = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$body['_user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'php-built-in';
$response = $app['router']->dispatch($method, $uri, $body, $token);
http_response_code($response['status'] ?? 200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
