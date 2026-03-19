<?php
require __DIR__ . '/../app/Support/PdfCryptoService.php';
require __DIR__ . '/../app/Services/LoginService.php';

use App\Support\PdfCryptoService;
use App\Services\LoginService;

function assertTrue(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$crypto = new PdfCryptoService();
$key = random_bytes(32);
$payload = $crypto->encrypt('hola pdf', $key, 'adjunto:1');
assertTrue($crypto->decrypt($payload, $key, 'adjunto:1') === 'hola pdf', 'AES-256-GCM');

$login = new LoginService();
$result = $login->attempt(['username' => 'operador', 'password' => 'secret']);
assertTrue(($result['ok'] ?? false) === true, 'login base');

echo "OK - smoke tests backend\n";
