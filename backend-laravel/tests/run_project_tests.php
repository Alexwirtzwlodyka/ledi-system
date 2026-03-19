<?php
require __DIR__ . '/../bootstrap.php';

use App\Support\AppFactory;

function assertTrue(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$storage = sys_get_temp_dir() . '/ledi_project_tests_' . bin2hex(random_bytes(4));
@mkdir($storage, 0777, true);
$app = AppFactory::make($storage);
$controllers = $app['controllers'];

$createdAdmin = $controllers['users']->store([
    'username' => 'admin',
    'email' => 'admin@ledi.local',
    'password' => 'Admin.1234',
    'role' => 'admin',
]);
assertTrue($createdAdmin['ok'] === true, 'crear admin');

$login = $controllers['auth']->login(['username' => 'admin', 'password' => 'Admin.1234']);
assertTrue($login['ok'] === true, 'login admin');
$actorId = $createdAdmin['data']['item']['id'];

$user = $controllers['users']->store([
    'username' => 'operador1',
    'email' => 'operador1@ledi.local',
    'password' => 'Operador.1234',
    'role' => 'operador',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($user['status'] === 201, 'crear operador');

$list = $controllers['users']->index();
assertTrue(count($list['data']['items']) === 2, 'listar usuarios');

$escribano = $controllers['escribanos']->store([
    'apellido' => 'Pérez',
    'nombre' => 'María',
    'dni' => '30.111.222',
    'matricula' => '345',
    'localidad' => 'La Rioja',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($escribano['status'] === 201, 'crear escribano');
$escribanoId = $escribano['data']['item']['id'];

$search = $controllers['escribanos']->index(['search' => 'per']);
assertTrue($search['data']['total'] === 1, 'buscar escribano');

$upload = $controllers['adjuntos']->store([
    'escribano_id' => $escribanoId,
    'filename' => 'legajo.pdf',
    'content' => '%PDF-1.4 contenido simulado',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($upload['status'] === 201, 'subir adjunto');
$adjuntoId = $upload['data']['item']['id'];

$stepUp = $controllers['auth']->stepUp([
    'username' => 'admin',
    'password' => 'Admin.1234',
    '_ip' => '127.0.0.1',
    '_user_agent' => 'cli',
]);
assertTrue($stepUp['ok'] === true, 'emitir step-up');

$download = $controllers['adjuntos']->download([
    'adjunto_id' => $adjuntoId,
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
    'step_up_token' => $stepUp['data']['step_up_token'],
    '_ip' => '127.0.0.1',
    '_user_agent' => 'cli',
]);
assertTrue($download['data']['content'] === '%PDF-1.4 contenido simulado', 'descargar adjunto');

$updatedUser = $controllers['users']->update(['user_id' => $user['data']['item']['id'], 'email' => 'nuevo@ledi.local', 'actor_user_id' => $actorId, '_actor' => ['id' => $actorId, 'role' => 'admin']]);
assertTrue($updatedUser['data']['item']['email'] === 'nuevo@ledi.local', 'actualizar usuario');

$updatedEscribano = $controllers['escribanos']->update(['escribano_id' => $escribanoId, 'localidad' => 'Chilecito', 'actor_user_id' => $actorId, '_actor' => ['id' => $actorId, 'role' => 'admin']]);
assertTrue($updatedEscribano['data']['item']['localidad'] === 'Chilecito', 'actualizar escribano');

$disabled = $controllers['users']->disable(['user_id' => $user['data']['item']['id'], 'actor_user_id' => $actorId, '_actor' => ['id' => $actorId, 'role' => 'admin']]);
assertTrue($disabled['ok'] === true && $disabled['data']['item']['is_active'] === false, 'bloquear usuario');

assertTrue(count($app['audit']->all()) >= 5, 'auditoría registrada');

echo "OK - project tests backend\n";
