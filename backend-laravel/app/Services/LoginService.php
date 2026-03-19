<?php
namespace App\Services;

class LoginService {
    public function attempt(array $credentials): array {
        $username = $credentials['username'] ?? '';
        $password = $credentials['password'] ?? '';
        if ($username === '' || $password === '') {
            return ['ok' => false, 'message' => 'Credenciales incompletas'];
        }
        return [
            'ok' => true,
            'requires_2fa' => $username === 'admin',
            'token' => $username === 'admin' ? null : 'fake-sanctum-token',
            'user' => ['username' => $username, 'role' => $username === 'admin' ? 'admin' : 'operador'],
        ];
    }
}
