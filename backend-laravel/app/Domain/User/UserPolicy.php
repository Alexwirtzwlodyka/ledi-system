<?php
namespace App\Domain\User;

final class UserPolicy
{
    public function canManage(array $actor): bool
    {
        return in_array(($actor['role'] ?? 'consulta'), ['admin'], true);
    }

    public function canCreateRole(array $actor, string $role): bool
    {
        if (($actor['role'] ?? 'consulta') !== 'admin') {
            return false;
        }
        return in_array($role, ['admin', 'operador', 'consulta'], true);
    }
}
