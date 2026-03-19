<?php
namespace App\Domain\User;

use App\Domain\Auth\PasswordHasher;
use App\Domain\Auth\SessionManager;
use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;

final class UserService
{
    public function __construct(
        private UserRepository $users,
        private PasswordHasher $hasher,
        private SessionManager $sessions,
        private AuditLogger $audit,
        private UserPolicy $policy,
    ) {}

    public function index(): array
    {
        $users = array_map(function (array $user): array {
            unset($user['password_hash']);
            return $user;
        }, $this->users->all());
        return Response::success(['items' => $users]);
    }

    public function create(array $payload, int $actorUserId = 0, array $actor = []): array
    {
        if ($actorUserId !== 0 && !$this->policy->canCreateRole($actor, (string) ($payload['role'] ?? 'operador'))) {
            return Response::error('No autorizado para crear usuarios con ese rol', 403);
        }
        if ($this->users->findByUsername($payload['username'])) {
            return Response::error('El username ya existe', 422);
        }

        $user = $this->users->create([
            'username' => $payload['username'],
            'email' => $payload['email'],
            'password_hash' => $this->hasher->hash($payload['password']),
            'role' => $payload['role'] ?? 'operador',
            'is_active' => (bool) ($payload['is_active'] ?? true),
            'must_change_password' => true,
        ]);

        $this->audit->log('USER_CREATED', 'user', (int) $user['id'], ['role' => $user['role']], $actorUserId ?: (int) $user['id']);
        unset($user['password_hash']);
        return Response::success(['item' => $user], 201);
    }

    public function update(int $userId, array $payload, int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canManage($actor)) {
            return Response::error('No autorizado', 403);
        }
        $changes = [];
        foreach (['email', 'role', 'is_active', 'must_change_password'] as $field) {
            if (array_key_exists($field, $payload)) {
                $changes[$field] = $field === 'email'
                    ? strtolower(trim((string) $payload[$field]))
                    : $payload[$field];
            }
        }
        if ($changes === []) {
            return Response::error('Sin cambios', 422);
        }
        $user = $this->users->update($userId, $changes);
        if (!$user) {
            return Response::error('Usuario no encontrado', 404);
        }
        $this->audit->log('USER_UPDATED', 'user', $userId, ['fields' => array_keys($changes)], $actorUserId ?: null);
        unset($user['password_hash']);
        return Response::success(['item' => $user]);
    }

    public function disable(int $userId, int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canManage($actor)) {
            return Response::error('No autorizado', 403);
        }
        $user = $this->users->update($userId, ['is_active' => false]);
        if (!$user) {
            return Response::error('Usuario no encontrado', 404);
        }
        $this->sessions->revokeAllForUser($userId);
        $this->audit->log('USER_DISABLED', 'user', $userId, [], $actorUserId ?: null);
        unset($user['password_hash']);
        return Response::success(['item' => $user]);
    }
}
