<?php
require dirname(__DIR__) . '/bootstrap.php';

use App\Support\AppFactory;

$app = AppFactory::make(dirname(__DIR__) . '/storage/runtime');
$users = $app['controllers']['users'];
$escribanos = $app['controllers']['escribanos'];

$admin = $app['users']->findByUsername('admin');
if (!$admin) {
    $users->store([
        'username' => 'admin',
        'email' => 'admin@ruell.local',
        'password' => 'Admin.1234',
        'role' => 'admin',
    ]);
}

$operador = $app['users']->findByUsername('operador1');
if (!$operador) {
    $users->store([
        'username' => 'operador1',
        'email' => 'operador1@ruell.local',
        'password' => 'Operador.1234',
        'role' => 'operador',
    ]);
}

$existingEscribanos = $app['escribanos']->all();
$hasEscribano = static function (string $dni) use ($existingEscribanos): bool {
    foreach ($existingEscribanos as $escribano) {
        if ((string) ($escribano['dni'] ?? '') === $dni) {
            return true;
        }
    }

    return false;
};

if (!$hasEscribano('30111222')) {
    $escribanos->store([
        'apellido' => 'Perez',
        'nombre' => 'Maria',
        'dni' => '30111222',
        'matricula' => '345',
        'registro' => '12',
        'tipo_escribano' => 'titular',
        'localidad' => 'La Rioja',
        'provincia' => 'La Rioja',
        'estado' => 'activo',
    ]);
}

if (!$hasEscribano('28777444')) {
    $escribanos->store([
        'apellido' => 'Gomez',
        'nombre' => 'Juan',
        'dni' => '28777444',
        'matricula' => '121',
        'registro' => '9',
        'tipo_escribano' => 'adscripto',
        'localidad' => 'Chilecito',
        'provincia' => 'La Rioja',
        'estado' => 'activo',
    ]);
}

echo "Seed completado\n";
