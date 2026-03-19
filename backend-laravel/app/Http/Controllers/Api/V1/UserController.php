<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\User\UserService;

final class UserController
{
    public function __construct(private UserService $service) {}

    public function index(array $payload = []): array { return $this->service->index(); }
    public function store(array $payload): array { return $this->service->create($payload, (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
    public function update(array $payload): array { return $this->service->update((int) ($payload['user_id'] ?? 0), $payload, (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
    public function disable(array $payload): array { return $this->service->disable((int) ($payload['user_id'] ?? 0), (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
}
