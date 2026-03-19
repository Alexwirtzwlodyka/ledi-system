<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\Auth\AuthService;

final class AuthController
{
    public function __construct(private AuthService $service) {}

    public function login(array $payload): array
    {
        return $this->service->login(
            (string) ($payload['username'] ?? ''),
            (string) ($payload['password'] ?? ''),
            (string) ($payload['_ip'] ?? '127.0.0.1'),
            (string) ($payload['_user_agent'] ?? 'cli')
        );
    }

    public function stepUp(array $payload): array
    {
        return $this->service->stepUp(
            (string) ($payload['username'] ?? ''),
            (string) ($payload['password'] ?? ''),
            (string) ($payload['_ip'] ?? '127.0.0.1'),
            (string) ($payload['_user_agent'] ?? 'cli')
        );
    }

    public function logout(array $payload): array
    {
        return $this->service->logout((string) ($payload['token'] ?? ''));
    }

    public function resolveSession(string $token): ?array
    {
        return $this->service->resolveSession($token);
    }
}
