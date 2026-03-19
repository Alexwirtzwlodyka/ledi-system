<?php
require __DIR__ . '/../bootstrap.php';

use App\Support\AppFactory;

function assertTrue(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$storage = sys_get_temp_dir() . '/ledi_router_tests_' . bin2hex(random_bytes(4));
@mkdir($storage, 0777, true);
$app = AppFactory::make($storage);
$router = $app['router'];

$seedAdmin = $app['controllers']['users']->store([
    'username' => 'admin',
    'email' => 'admin@ledi.local',
    'password' => 'Admin.1234',
    'role' => 'admin',
]);
assertTrue($seedAdmin['status'] === 201, 'seed admin');

$login = $router->dispatch('POST', '/api/v1/auth/login', [
    'username' => 'admin',
    'password' => 'Admin.1234',
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
]);
assertTrue($login['ok'] === true, 'router login');
$token = $login['data']['token'];

$createUser = $router->dispatch('POST', '/api/v1/users', [
    'username' => 'consulta1',
    'email' => 'consulta1@ledi.local',
    'password' => 'Consulta.1234',
    'role' => 'consulta',
], $token);
assertTrue($createUser['status'] === 201, 'router crear usuario');

$createEscribano = $router->dispatch('POST', '/api/v1/escribanos', [
    'apellido' => 'Sosa',
    'nombre' => 'Elena',
    'dni' => '29.112.334',
    'matricula' => '55',
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
], $token);
assertTrue($createEscribano['status'] === 201, 'router crear escribano');
$eid = $createEscribano['data']['item']['id'];

$adjunto = $router->dispatch('POST', '/api/v1/adjuntos', [
    'escribano_id' => $eid,
    'filename' => 'ficha.pdf',
    'content' => '%PDF-1.4 router test',
], $token);
assertTrue($adjunto['status'] === 201, 'router upload adjunto');
$aid = $adjunto['data']['item']['id'];

$downloadFail = $router->dispatch('POST', '/api/v1/adjuntos/download', [
    'adjunto_id' => $aid,
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
], $token);
assertTrue($downloadFail['status'] === 403, 'step-up requerido');

$stepUp = $router->dispatch('POST', '/api/v1/auth/step-up', [
    'username' => 'admin',
    'password' => 'Admin.1234',
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
]);
assertTrue($stepUp['ok'] === true, 'emitir step-up');

$downloadOk = $router->dispatch('POST', '/api/v1/adjuntos/download', [
    'adjunto_id' => $aid,
    'step_up_token' => $stepUp['data']['step_up_token'],
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
], $token);
assertTrue($downloadOk['data']['content'] === '%PDF-1.4 router test', 'download con step-up');

$audit = $router->dispatch('GET', '/api/v1/audit?action=ADJUNTO_DOWNLOADED', [], $token);
assertTrue($audit['data']['total'] >= 1, 'audit filtrado');

echo "OK - router tests\n";
