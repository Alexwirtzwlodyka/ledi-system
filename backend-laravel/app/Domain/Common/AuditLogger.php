<?php
namespace App\Domain\Common;

use App\Infrastructure\Database;

final class AuditLogger
{
    public function __construct(private Database $db) {}

    public function log(string $action, string $targetType, int|string $targetId, array $metadata = [], ?int $actorUserId = null): array
    {
        return $this->db->insert('audit_logs', [
            'actor_user_id' => $actorUserId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'metadata' => $metadata,
            'created_at' => gmdate('c'),
        ]);
    }

    public function all(array $filters = []): array
    {
        $action = strtolower(trim((string) ($filters['action'] ?? '')));
        $targetType = strtolower(trim((string) ($filters['target_type'] ?? '')));
        $conditions = [];
        $params = [];

        if ($action !== '') {
            $conditions[] = 'LOWER(action) = :action';
            $params['action'] = $action;
        }
        if ($targetType !== '') {
            $conditions[] = 'LOWER(target_type) = :target_type';
            $params['target_type'] = $targetType;
        }

        return $this->db->select('audit_logs', $conditions, $params, ['created_at DESC', 'id DESC']);
    }
}
