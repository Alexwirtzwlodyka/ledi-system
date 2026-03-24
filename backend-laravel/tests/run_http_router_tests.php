<?php
require __DIR__ . '/../bootstrap.php';

use App\Support\AppFactory;

function assertTrue(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$storage = sys_get_temp_dir() . '/ruell_router_tests_' . bin2hex(random_bytes(4));
@mkdir($storage, 0777, true);
$app = AppFactory::make($storage);
$router = $app['router'];

$seedAdmin = $app['controllers']['users']->store([
    'username' => 'admin',
    'email' => 'admin@ruell.local',
    'dni' => '20111222',
    'email_personal' => 'admin.personal@ruell.local',
    'email_laboral' => 'admin.laboral@ruell.local',
    'direccion_personal' => 'Casa admin 1',
    'direccion_laboral' => 'Oficina admin 1',
    'direccion_personal_calle' => 'Casa admin',
    'direccion_personal_numeracion' => '1',
    'direccion_personal_barrio' => 'Centro',
    'direccion_laboral_calle' => 'Oficina admin',
    'direccion_laboral_numeracion' => '1',
    'direccion_laboral_barrio' => 'Macrocentro',
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
    'email' => 'consulta1@ruell.local',
    'dni' => '30123456',
    'email_personal' => 'consulta.personal@ruell.local',
    'email_laboral' => 'consulta.laboral@ruell.local',
    'direccion_personal' => 'Casa consulta 1',
    'direccion_laboral' => 'Oficina consulta 1',
    'direccion_personal_calle' => 'Casa consulta',
    'direccion_personal_numeracion' => '1',
    'direccion_personal_barrio' => 'Centro',
    'direccion_laboral_calle' => 'Oficina consulta',
    'direccion_laboral_numeracion' => '1',
    'direccion_laboral_barrio' => 'Macrocentro',
    'password' => 'Consulta.1234',
    'role' => 'consulta',
], $token);
assertTrue($createUser['status'] === 201, 'router crear usuario');

$duplicateUser = $router->dispatch('POST', '/api/v1/users', [
    'username' => 'consulta2',
    'email' => 'consulta2@ruell.local',
    'dni' => '30.123.456',
    'password' => 'Consulta.1234',
    'role' => 'consulta',
], $token);
assertTrue($duplicateUser['status'] === 422, 'router rechaza dni duplicado usuario');

$createEscribano = $router->dispatch('POST', '/api/v1/escribanos', [
    'apellido' => 'Sosa',
    'nombre' => 'Elena',
    'dni' => '29.112.334',
    'matricula' => '55',
    'email_personal' => 'elena.personal@ruell.local',
    'email_laboral' => 'elena.estudio@ruell.local',
    'telefono' => '3804440000',
    'direccion_domicilio' => 'Domicilio 123',
    'direccion_estudio' => 'Estudio 456',
    'direccion_domicilio_calle' => 'Domicilio',
    'direccion_domicilio_numeracion' => '123',
    'direccion_domicilio_barrio' => 'Centro',
    'direccion_estudio_calle' => 'Estudio',
    'direccion_estudio_numeracion' => '456',
    'direccion_estudio_barrio' => 'Tribunales',
    'fecha_nacimiento' => '1987-01-11',
    'fecha_egresado' => '2010-12-03',
    'fecha_matriculado' => '2011-03-25',
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
], $token);
assertTrue($createEscribano['status'] === 201, 'router crear escribano');
$eid = $createEscribano['data']['item']['id'];

$updateUserLinked = $router->dispatch('PATCH', '/api/v1/users', [
    'user_id' => $createUser['data']['item']['id'],
    'email_personal' => 'consulta.personal.editada@ruell.local',
    'email_laboral' => 'consulta.laboral.editada@ruell.local',
    'celular' => '3804000111',
    'escribano_id_vinculado' => $eid,
], $token);
assertTrue($updateUserLinked['status'] === 200, 'router vincular usuario con escribano');
assertTrue($updateUserLinked['data']['item']['registro_vinculado'] === '55', 'router registro vinculado deriva del escribano');

$duplicateEscribano = $router->dispatch('POST', '/api/v1/escribanos', [
    'apellido' => 'Sosa',
    'nombre' => 'Elena 2',
    'dni' => '29112334',
], $token);
assertTrue($duplicateEscribano['status'] === 422, 'router rechaza dni duplicado');

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

$updateAdjunto = $router->dispatch('PATCH', '/api/v1/adjuntos', [
    'adjunto_id' => $aid,
    'filename' => 'ficha-editada.pdf',
    'content' => base64_encode('%PDF-1.4 router update'),
    'content_encoding' => 'base64',
], $token);
assertTrue($updateAdjunto['status'] === 200, 'router editar adjunto');

$stepUp2 = $router->dispatch('POST', '/api/v1/auth/step-up', [
    'username' => 'admin',
    'password' => 'Admin.1234',
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
]);
assertTrue($stepUp2['ok'] === true, 'emitir segundo step-up router');

$downloadUpdated = $router->dispatch('POST', '/api/v1/adjuntos/download', [
    'adjunto_id' => $aid,
    'step_up_token' => $stepUp2['data']['step_up_token'],
    '_ip' => '10.0.0.10',
    '_user_agent' => 'phpunit-router',
], $token);
assertTrue($downloadUpdated['data']['content'] === '%PDF-1.4 router update', 'download editado con step-up');

$audit = $router->dispatch('GET', '/api/v1/audit?action=ADJUNTO_DOWNLOADED', [], $token);
assertTrue($audit['data']['total'] >= 1, 'audit filtrado');

echo "OK - router tests\n";
