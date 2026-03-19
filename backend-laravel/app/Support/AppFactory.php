<?php
namespace App\Support;

use App\Domain\Adjunto\AdjuntoPolicy;
use App\Domain\Adjunto\AdjuntoRepository;
use App\Domain\Adjunto\AdjuntoService;
use App\Domain\Auth\AuthRateLimiter;
use App\Domain\Auth\AuthService;
use App\Domain\Auth\PasswordHasher;
use App\Domain\Auth\SessionManager;
use App\Domain\Auth\StepUpService;
use App\Domain\Common\AuditLogger;
use App\Domain\Common\Router;
use App\Domain\Escribano\EscribanoPolicy;
use App\Domain\Escribano\EscribanoRepository;
use App\Domain\Escribano\EscribanoService;
use App\Domain\User\UserPolicy;
use App\Domain\User\UserRepository;
use App\Domain\User\UserService;
use App\Http\Controllers\Api\V1\AdjuntoController;
use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EscribanoController;
use App\Http\Controllers\Api\V1\UserController;
use App\Infrastructure\Database;
use App\Infrastructure\Migrator;

final class AppFactory
{
    public static function make(string $storagePath): array
    {
        $database = new Database($storagePath);
        (new Migrator($database))->migrate();

        $audit = new AuditLogger($database);
        $users = new UserRepository($database);
        $sessions = new SessionManager($database);
        $escribanos = new EscribanoRepository($database);
        $adjuntos = new AdjuntoRepository($database);
        $hasher = new PasswordHasher();
        $key = hash('sha256', 'ledi-master-key', true);
        $stepUp = new StepUpService($database);
        $authService = new AuthService($users, $hasher, $sessions, $audit, new AuthRateLimiter(), $stepUp);

        $controllers = [
            'auth' => new AuthController($authService),
            'users' => new UserController(new UserService($users, $hasher, $sessions, $audit, new UserPolicy())),
            'escribanos' => new EscribanoController(new EscribanoService($escribanos, $audit, new EscribanoPolicy())),
            'adjuntos' => new AdjuntoController(new AdjuntoService($adjuntos, $escribanos, new PdfCryptoService(), $audit, $key, new AdjuntoPolicy(), $authService)),
            'audit' => new AuditController($audit),
        ];

        $routes = require dirname(__DIR__, 2) . '/routes/api.php';

        return [
            'db' => $database,
            'audit' => $audit,
            'users' => $users,
            'sessions' => $sessions,
            'escribanos' => $escribanos,
            'adjuntos' => $adjuntos,
            'controllers' => $controllers,
            'router' => new Router($routes, $controllers),
        ];
    }
}
