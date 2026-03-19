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

    public function index(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $users = array_map(function (array $user): array {
            unset($user['password_hash']);
            return $user;
        }, $this->users->all($search));
        return Response::success(['items' => $users, 'total' => count($users)]);
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
            'celular' => $payload['celular'] ?? '',
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
        foreach (['email', 'celular', 'role', 'is_active', 'must_change_password'] as $field) {
            if (array_key_exists($field, $payload)) {
                $changes[$field] = $field === 'email'
                    ? strtolower(trim((string) $payload[$field]))
                    : $payload[$field];
            }
        }
        if (array_key_exists('password', $payload) && trim((string) $payload['password']) !== '') {
            $changes['password_hash'] = $this->hasher->hash((string) $payload['password']);
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

    public function delete(int $userId, int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canManage($actor)) {
            return Response::error('No autorizado', 403);
        }
        if ($actorUserId !== 0 && $actorUserId === $userId) {
            return Response::error('No puedes eliminar tu propio usuario', 422);
        }
        $user = $this->users->find($userId);
        if ($user === null) {
            return Response::error('Usuario no encontrado', 404);
        }
        if (!$this->users->delete($userId)) {
            return Response::error('No se pudo eliminar usuario', 500);
        }
        $this->sessions->revokeAllForUser($userId);
        $this->audit->log('USER_DELETED', 'user', $userId, ['username' => $user['username']], $actorUserId ?: null);
        unset($user['password_hash']);
        return Response::success(['item' => $user]);
    }
}
