<?php
namespace App\Http\Requests\Auth;

class LoginRequest {
    public function __construct(private array $data) {}
    public function validated(): array {
        return [
            'username' => trim((string)($this->data['username'] ?? '')),
            'password' => (string)($this->data['password'] ?? ''),
            'otp' => isset($this->data['otp']) ? trim((string)$this->data['otp']) : null,
        ];
    }
}
