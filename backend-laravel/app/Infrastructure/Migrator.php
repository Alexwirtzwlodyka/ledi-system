<?php
namespace App\Infrastructure;

final class Migrator
{
    public function __construct(private Database $db) {}

    public function migrate(): void
    {
        foreach (['users', 'escribanos', 'sessions', 'step_up_tokens', 'audit_logs', 'adjuntos'] as $table) {
            $this->db->ensureTable($table);
        }
    }
}
