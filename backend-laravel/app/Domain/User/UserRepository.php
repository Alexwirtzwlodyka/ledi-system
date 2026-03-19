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
            $conditions[] = '(LOWER(username) LIKE :search OR LOWER(email) LIKE :search OR LOWER(celular) LIKE :search OR LOWER(role) LIKE :search)';
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

    public function create(array $data): array
    {
        return $this->map($this->db->insert('users', [
            'username' => trim((string) $data['username']),
            'email' => strtolower(trim((string) $data['email'])),
            'celular' => trim((string) ($data['celular'] ?? '')),
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
        if (array_key_exists('celular', $changes)) {
            $changes['celular'] = trim((string) $changes['celular']);
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
