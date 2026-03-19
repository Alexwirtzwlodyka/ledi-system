<?php
namespace App\Http\Requests\User;

class StoreUserRequest {
    public function __construct(private array $data) {}
    public function validated(): array {
        return [
            'username' => trim((string)($this->data['username'] ?? '')),
            'email' => strtolower(trim((string)($this->data['email'] ?? ''))),
            'role' => trim((string)($this->data['role'] ?? 'consulta')),
            'is_active' => (bool)($this->data['is_active'] ?? true),
        ];
    }
}
