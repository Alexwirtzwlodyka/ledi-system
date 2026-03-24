<?php
namespace App\Domain\User;

use App\Domain\Auth\PasswordHasher;
use App\Domain\Auth\SessionManager;
use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;
use App\Domain\Escribano\EscribanoRepository;

final class UserService
{
    public function __construct(
        private UserRepository $users,
        private PasswordHasher $hasher,
        private SessionManager $sessions,
        private AuditLogger $audit,
        private UserPolicy $policy,
        private EscribanoRepository $escribanos,
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

        $errors = [];
        $username = trim((string) ($payload['username'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        if ($username === '') {
            $errors['username'] = 'El usuario es obligatorio';
        } elseif ($this->users->findByUsername($username)) {
            $errors['username'] = 'El username ya existe';
        }
        if ($email === '') {
            $errors['email'] = 'El mail de acceso es obligatorio';
        }
        if (trim($password) === '') {
            $errors['password'] = 'La contrasena es obligatoria';
        }

        $dni = preg_replace('/\D+/', '', (string) ($payload['dni'] ?? ''));
        if ($dni === '') {
            $errors['dni'] = 'El DNI es obligatorio';
        } elseif ($this->users->findByDni($dni)) {
            $errors['dni'] = 'Ya existe un usuario con ese DNI';
        }
        $vinculo = $this->resolveRegistroLink($payload);
        if ($vinculo['error'] !== null) {
            $errors['registro_vinculado'] = $vinculo['error'];
        }

        if ($errors !== []) {
            error_log('USER_CREATE_REJECTED ' . json_encode([
                'username' => $username,
                'email' => $email,
                'dni' => $dni,
                'role' => (string) ($payload['role'] ?? 'operador'),
                'escribano_id_vinculado' => $payload['escribano_id_vinculado'] ?? null,
                'errors' => $errors,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            return Response::error('No se pudo crear el usuario. Revisa los campos marcados.', 422, $errors);
        }

        $user = $this->users->create([
            'username' => $username,
            'email' => $email,
            'dni' => $dni,
            'celular' => $payload['celular'] ?? '',
            'email_personal' => $payload['email_personal'] ?? '',
            'email_laboral' => $payload['email_laboral'] ?? '',
            'direccion_personal' => $payload['direccion_personal'] ?? '',
            'direccion_laboral' => $payload['direccion_laboral'] ?? '',
            'direccion_personal_calle' => $payload['direccion_personal_calle'] ?? '',
            'direccion_personal_numeracion' => $payload['direccion_personal_numeracion'] ?? '',
            'direccion_personal_barrio' => $payload['direccion_personal_barrio'] ?? '',
            'direccion_laboral_calle' => $payload['direccion_laboral_calle'] ?? '',
            'direccion_laboral_numeracion' => $payload['direccion_laboral_numeracion'] ?? '',
            'direccion_laboral_barrio' => $payload['direccion_laboral_barrio'] ?? '',
            'escribano_id_vinculado' => $vinculo['escribano_id'],
            'registro_vinculado' => $vinculo['registro'],
            'password_hash' => $this->hasher->hash($password),
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
        foreach ([
            'email_personal',
            'email_laboral',
            'celular',
            'registro_vinculado',
            'direccion_personal',
            'direccion_laboral',
            'direccion_personal_calle',
            'direccion_personal_numeracion',
            'direccion_personal_barrio',
            'direccion_laboral_calle',
            'direccion_laboral_numeracion',
            'direccion_laboral_barrio',
        ] as $field) {
            if (array_key_exists($field, $payload)) {
                $changes[$field] = str_starts_with($field, 'email_')
                    ? strtolower(trim((string) $payload[$field]))
                    : trim((string) $payload[$field]);
            }
        }
        if (array_key_exists('password', $payload) && trim((string) $payload['password']) !== '') {
            $changes['password_hash'] = $this->hasher->hash((string) $payload['password']);
            $changes['must_change_password'] = false;
        }
        if (array_key_exists('escribano_id_vinculado', $payload) || array_key_exists('registro_vinculado', $payload)) {
            $vinculo = $this->resolveRegistroLink($payload);
            if ($vinculo['error'] !== null) {
                return Response::error($vinculo['error'], 422, ['registro_vinculado' => 'Invalido']);
            }
            $changes['escribano_id_vinculado'] = $vinculo['escribano_id'];
            $changes['registro_vinculado'] = $vinculo['registro'];
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

    private function resolveRegistroLink(array $payload): array
    {
        $escribanoId = (int) ($payload['escribano_id_vinculado'] ?? 0);
        if ($escribanoId <= 0) {
            return ['escribano_id' => null, 'registro' => '', 'error' => null];
        }

        $escribano = $this->escribanos->find($escribanoId);
        if ($escribano === null) {
            return ['escribano_id' => null, 'registro' => '', 'error' => 'El escribano vinculado no existe'];
        }

        return [
            'escribano_id' => $escribanoId,
            'registro' => trim((string) ($escribano['registro'] ?? '')),
            'error' => null,
        ];
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
