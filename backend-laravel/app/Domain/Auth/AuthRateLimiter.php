<?php
namespace App\Domain\Auth;

final class AuthRateLimiter
{
    private array $attempts = [];

    public function hit(string $key): void
    {
        $this->attempts[$key] = ($this->attempts[$key] ?? 0) + 1;
    }

    public function tooManyAttempts(string $key, int $maxAttempts = 5): bool
    {
        return ($this->attempts[$key] ?? 0) >= $maxAttempts;
    }

    public function clear(string $key): void
    {
        unset($this->attempts[$key]);
    }
}
