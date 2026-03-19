<?php
namespace App\Domain\Auth;

use App\Infrastructure\Database;

final class StepUpService
{
    public function __construct(private Database $db) {}

    public function issue(int $userId, string $ip, string $userAgent, int $ttlSeconds = 300): array
    {
        return $this->db->insert('step_up_tokens', [
            'user_id' => $userId,
            'token' => bin2hex(random_bytes(16)),
            'ip' => $ip,
            'user_agent' => $userAgent,
            'expires_at' => time() + $ttlSeconds,
            'used_at' => null,
            'created_at' => gmdate('c'),
        ]);
    }

    public function consume(string $token, int $userId, string $ip, string $userAgent): bool
    {
        $updated = $this->db->updateFirstBy(
            'step_up_tokens',
            [
                'token = :token',
                'user_id = :user_id',
                'ip = :ip',
                'user_agent = :user_agent',
                'used_at IS NULL',
                'expires_at >= :now_ts',
            ],
            [
                'token' => $token,
                'user_id' => $userId,
                'ip' => $ip,
                'user_agent' => $userAgent,
                'now_ts' => time(),
            ],
            ['used_at' => gmdate('c')]
        );

        return $updated !== null;
    }
}
