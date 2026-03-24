<?php
namespace App\Services;

class UserService {
    public function index(): array {
        return [['id' => 1, 'username' => 'admin', 'email' => 'admin@ruell.local', 'role' => 'admin', 'is_active' => true]];
    }
    public function store(array $data): array { $data['id'] = 999; return $data; }
}
