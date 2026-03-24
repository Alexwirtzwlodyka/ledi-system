<?php
require __DIR__ . '/../bootstrap.php';

use App\Support\AppFactory;

function assertTrue(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$storage = sys_get_temp_dir() . '/ruell_project_tests_' . bin2hex(random_bytes(4));
@mkdir($storage, 0777, true);
$app = AppFactory::make($storage);
$controllers = $app['controllers'];

$createdAdmin = $controllers['users']->store([
    'username' => 'admin',
    'email' => 'admin@ruell.local',
    'dni' => '20111222',
    'celular' => '3804000000',
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
assertTrue($createdAdmin['ok'] === true, 'crear admin');

$login = $controllers['auth']->login(['username' => 'admin', 'password' => 'Admin.1234']);
assertTrue($login['ok'] === true, 'login admin');
$actorId = $createdAdmin['data']['item']['id'];

$user = $controllers['users']->store([
    'username' => 'operador1',
    'email' => 'operador1@ruell.local',
    'dni' => '23123456',
    'celular' => '3804123456',
    'email_personal' => 'operador.personal@ruell.local',
    'email_laboral' => 'operador.laboral@ruell.local',
    'direccion_personal' => 'Casa operador 2',
    'direccion_laboral' => 'Oficina operador 2',
    'direccion_personal_calle' => 'Casa operador',
    'direccion_personal_numeracion' => '2',
    'direccion_personal_barrio' => 'Centro',
    'direccion_laboral_calle' => 'Oficina operador',
    'direccion_laboral_numeracion' => '2',
    'direccion_laboral_barrio' => 'Macrocentro',
    'password' => 'Operador.1234',
    'role' => 'operador',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($user['status'] === 201, 'crear operador');
assertTrue($user['data']['item']['direccion_personal_calle'] === 'Casa operador', 'guardar calle usuario');

$list = $controllers['users']->index(['search' => 'ruell.local']);
assertTrue(count($list['data']['items']) === 2, 'listar usuarios');

$duplicateUserDni = $controllers['users']->store([
    'username' => 'operador2',
    'email' => 'operador2@ruell.local',
    'dni' => '23.123.456',
    'password' => 'Operador.1234',
    'role' => 'consulta',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($duplicateUserDni['status'] === 422, 'rechazar dni duplicado usuario');

$escribano = $controllers['escribanos']->store([
    'apellido' => 'Pérez',
    'nombre' => 'María',
    'dni' => '30.111.222',
    'matricula' => '345',
    'email_personal' => 'maria.personal@ruell.local',
    'email_laboral' => 'maria.laboral@ruell.local',
    'telefono' => '3804551212',
    'direccion_domicilio' => 'Av. Siempre Viva 123',
    'direccion_estudio' => 'San Martin 456',
    'direccion_domicilio_calle' => 'Av. Siempre Viva',
    'direccion_domicilio_numeracion' => '123',
    'direccion_domicilio_barrio' => 'Centro',
    'direccion_estudio_calle' => 'San Martin',
    'direccion_estudio_numeracion' => '456',
    'direccion_estudio_barrio' => 'Tribunales',
    'fecha_nacimiento' => '1988-04-21',
    'fecha_egresado' => '2011-12-10',
    'fecha_matriculado' => '2012-03-15',
    'localidad' => 'La Rioja',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($escribano['status'] === 201, 'crear escribano');
assertTrue($escribano['data']['item']['direccion_domicilio_calle'] === 'Av. Siempre Viva', 'guardar calle escribano');
$escribanoId = $escribano['data']['item']['id'];

$search = $controllers['escribanos']->index(['search' => 'per']);
assertTrue($search['data']['total'] === 1, 'buscar escribano');

$duplicateDni = $controllers['escribanos']->store([
    'apellido' => 'Pereyra',
    'nombre' => 'Ana',
    'dni' => '30111222',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($duplicateDni['status'] === 422, 'rechazar dni duplicado');

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

$updatedAdjunto = $controllers['adjuntos']->update([
    'adjunto_id' => $adjuntoId,
    'filename' => 'legajo-actualizado.pdf',
    'content' => base64_encode('%PDF-1.4 contenido actualizado'),
    'content_encoding' => 'base64',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($updatedAdjunto['status'] === 200, 'editar adjunto');
assertTrue($updatedAdjunto['data']['item']['nombre_original'] === 'legajo-actualizado.pdf', 'renombrar adjunto');

$stepUpUpdated = $controllers['auth']->stepUp([
    'username' => 'admin',
    'password' => 'Admin.1234',
    '_ip' => '127.0.0.1',
    '_user_agent' => 'cli',
]);
assertTrue($stepUpUpdated['ok'] === true, 'emitir segundo step-up');

$downloadUpdated = $controllers['adjuntos']->download([
    'adjunto_id' => $adjuntoId,
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
    'step_up_token' => $stepUpUpdated['data']['step_up_token'],
    '_ip' => '127.0.0.1',
    '_user_agent' => 'cli',
]);
assertTrue($downloadUpdated['data']['content'] === '%PDF-1.4 contenido actualizado', 'descargar adjunto editado');

$updatedUser = $controllers['users']->update([
    'user_id' => $user['data']['item']['id'],
    'email_personal' => 'nuevo.personal@ruell.local',
    'email_laboral' => 'nuevo.laboral@ruell.local',
    'celular' => '3804999999',
    'escribano_id_vinculado' => $escribanoId,
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin']
]);
assertTrue($updatedUser['data']['item']['email_personal'] === 'nuevo.personal@ruell.local', 'actualizar mail personal usuario');
assertTrue($updatedUser['data']['item']['celular'] === '3804999999', 'actualizar celular usuario');
assertTrue($updatedUser['data']['item']['registro_vinculado'] === '345', 'actualizar registro vinculado usuario');
assertTrue((int) $updatedUser['data']['item']['escribano_id_vinculado'] === $escribanoId, 'actualizar escribano vinculado usuario');

$updatedEscribano = $controllers['escribanos']->update([
    'escribano_id' => $escribanoId,
    'localidad' => 'Chilecito',
    'email_personal' => 'maria.editada@ruell.local',
    'direccion_estudio' => 'Belgrano 999',
    'direccion_estudio_calle' => 'Belgrano',
    'direccion_estudio_numeracion' => '999',
    'direccion_estudio_barrio' => 'Centro',
    'actor_user_id' => $actorId,
    '_actor' => ['id' => $actorId, 'role' => 'admin'],
]);
assertTrue($updatedEscribano['data']['item']['localidad'] === 'Chilecito', 'actualizar escribano');
assertTrue($updatedEscribano['data']['item']['email_personal'] === 'maria.editada@ruell.local', 'actualizar mail personal escribano');
assertTrue($updatedEscribano['data']['item']['direccion_estudio_numeracion'] === '999', 'actualizar direccion separada escribano');

$forbiddenEscribanoUpdate = $controllers['escribanos']->update([
    'escribano_id' => $escribanoId,
    'localidad' => 'Aimogasta',
    'actor_user_id' => $user['data']['item']['id'],
    '_actor' => ['id' => $user['data']['item']['id'], 'role' => 'operador'],
]);
assertTrue($forbiddenEscribanoUpdate['status'] === 403, 'bloquear edicion escribano para operador');

$deleted = $controllers['users']->destroy(['user_id' => $user['data']['item']['id'], 'actor_user_id' => $actorId, '_actor' => ['id' => $actorId, 'role' => 'admin']]);
assertTrue($deleted['ok'] === true && $deleted['data']['item']['username'] === 'operador1', 'eliminar usuario');

assertTrue(count($app['audit']->all()) >= 5, 'auditoría registrada');

echo "OK - project tests backend\n";
