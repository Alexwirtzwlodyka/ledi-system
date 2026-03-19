<?php
namespace App\Domain\Auth;

use App\Infrastructure\Database;

final class SessionManager
{
    public function __construct(private Database $db) {}

    public function create(int $userId, string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        return $this->db->insert('sessions', [
            'user_id' => $userId,
            'token' => bin2hex(random_bytes(20)),
            'ip' => $ip,
            'user_agent' => $userAgent,
            'login_at' => gmdate('c'),
            'revoked_at' => null,
        ]);
    }

    public function revokeByToken(string $token): void
    {
        $this->db->updateManyBy(
            'sessions',
            ['token = :token', 'revoked_at IS NULL'],
            ['token' => $token],
            ['revoked_at' => gmdate('c')]
        );
    }

    public function revokeAllForUser(int $userId): void
    {
        $this->db->updateManyBy(
            'sessions',
            ['user_id = :user_id', 'revoked_at IS NULL'],
            ['user_id' => $userId],
            ['revoked_at' => gmdate('c')]
        );
    }

    public function findActiveByToken(string $token): ?array
    {
        return $this->db->firstBy(
            'sessions',
            ['token = :token', 'revoked_at IS NULL'],
            ['token' => $token]
        );
    }

    public function all(): array
    {
        return $this->db->select('sessions', [], [], ['id DESC']);
    }
}
