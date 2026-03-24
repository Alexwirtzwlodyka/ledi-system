<?php
namespace App\Domain\User;

use App\Infrastructure\Database;

final class UserRepository
{
    public function __construct(private Database $db) {}

    public function all(string $search = ''): array
    {
        $needle = trim($search);
        $conditions = [];
        $params = [];

        if ($needle !== '') {
            $conditions[] = '(LOWER(username) LIKE :search OR LOWER(email) LIKE :search OR LOWER(COALESCE(email_personal, \'\')) LIKE :search OR LOWER(COALESCE(email_laboral, \'\')) LIKE :search OR LOWER(celular) LIKE :search OR LOWER(role) LIKE :search OR LOWER(COALESCE(dni, \'\')) LIKE :search OR LOWER(COALESCE(registro_vinculado, \'\')) LIKE :search)';
            $params['search'] = '%' . strtolower($needle) . '%';
        }

        return array_map([$this, 'map'], $this->db->select('users', $conditions, $params, ['username ASC', 'id ASC']));
    }

    public function find(int $id): ?array
    {
        $row = $this->db->firstBy('users', ['id = :id'], ['id' => $id]);
        return $row ? $this->map($row) : null;
    }

    public function findByUsername(string $username): ?array
    {
        $needle = strtolower(trim($username));
        $row = $this->db->firstBy('users', ['LOWER(username) = :username'], ['username' => $needle]);
        return $row ? $this->map($row) : null;
    }

    public function findByDni(string $dni): ?array
    {
        $normalized = preg_replace('/\D+/', '', $dni);
        if ($normalized === '') {
            return null;
        }

        $row = $this->db->firstBy('users', ['dni = :dni'], ['dni' => $normalized]);
        return $row ? $this->map($row) : null;
    }

    public function create(array $data): array
    {
        return $this->map($this->db->insert('users', [
            'username' => trim((string) $data['username']),
            'email' => strtolower(trim((string) $data['email'])),
            'dni' => preg_replace('/\D+/', '', (string) ($data['dni'] ?? '')),
            'celular' => trim((string) ($data['celular'] ?? '')),
            'email_personal' => strtolower(trim((string) ($data['email_personal'] ?? ''))),
            'email_laboral' => strtolower(trim((string) ($data['email_laboral'] ?? ''))),
            'direccion_personal' => trim((string) ($data['direccion_personal'] ?? '')),
            'direccion_laboral' => trim((string) ($data['direccion_laboral'] ?? '')),
            'direccion_personal_calle' => trim((string) ($data['direccion_personal_calle'] ?? '')),
            'direccion_personal_numeracion' => trim((string) ($data['direccion_personal_numeracion'] ?? '')),
            'direccion_personal_barrio' => trim((string) ($data['direccion_personal_barrio'] ?? '')),
            'direccion_laboral_calle' => trim((string) ($data['direccion_laboral_calle'] ?? '')),
            'direccion_laboral_numeracion' => trim((string) ($data['direccion_laboral_numeracion'] ?? '')),
            'direccion_laboral_barrio' => trim((string) ($data['direccion_laboral_barrio'] ?? '')),
            'escribano_id_vinculado' => isset($data['escribano_id_vinculado']) && $data['escribano_id_vinculado'] !== '' ? (int) $data['escribano_id_vinculado'] : null,
            'registro_vinculado' => trim((string) ($data['registro_vinculado'] ?? '')),
            'password_hash' => $data['password_hash'],
            'role' => $data['role'] ?? 'operador',
            'is_active' => (bool) ($data['is_active'] ?? true),
            'must_change_password' => (bool) ($data['must_change_password'] ?? false),
            'created_at' => gmdate('c'),
            'updated_at' => gmdate('c'),
        ]));
    }

    public function update(int $id, array $changes): ?array
    {
        if (array_key_exists('email', $changes)) {
            $changes['email'] = strtolower(trim((string) $changes['email']));
        }
        if (array_key_exists('dni', $changes)) {
            $changes['dni'] = preg_replace('/\D+/', '', (string) $changes['dni']);
        }
        if (array_key_exists('celular', $changes)) {
            $changes['celular'] = trim((string) $changes['celular']);
        }
        foreach (['email_personal', 'email_laboral'] as $field) {
            if (array_key_exists($field, $changes)) {
                $changes[$field] = strtolower(trim((string) $changes[$field]));
            }
        }
        foreach ([
            'direccion_personal',
            'direccion_laboral',
            'direccion_personal_calle',
            'direccion_personal_numeracion',
            'direccion_personal_barrio',
            'direccion_laboral_calle',
            'direccion_laboral_numeracion',
            'direccion_laboral_barrio',
            'registro_vinculado',
        ] as $field) {
            if (array_key_exists($field, $changes)) {
                $changes[$field] = trim((string) $changes[$field]);
            }
        }
        if (array_key_exists('escribano_id_vinculado', $changes)) {
            $changes['escribano_id_vinculado'] = $changes['escribano_id_vinculado'] === null || $changes['escribano_id_vinculado'] === ''
                ? null
                : (int) $changes['escribano_id_vinculado'];
        }
        $changes['updated_at'] = gmdate('c');

        $updated = $this->db->updateById('users', $id, $changes);
        return $updated ? $this->map($updated) : null;
    }

    public function delete(int $id): bool
    {
        return $this->db->deleteById('users', $id);
    }

    private function map(array $row): array
    {
        $row['id'] = (int) $row['id'];
        $row['is_active'] = (bool) $row['is_active'];
        $row['must_change_password'] = (bool) $row['must_change_password'];
        return $row;
    }
}
