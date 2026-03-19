<?php
require dirname(__DIR__) . '/bootstrap.php';

use App\Support\AppFactory;

$app = AppFactory::make(dirname(__DIR__) . '/storage/runtime');
echo "Almacenamiento inicializado en: " . $app['db']->path() . PHP_EOL;
