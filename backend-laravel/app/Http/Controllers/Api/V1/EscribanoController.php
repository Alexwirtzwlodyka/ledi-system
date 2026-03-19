<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\Escribano\EscribanoService;

final class EscribanoController
{
    public function __construct(private EscribanoService $service) {}

    public function index(array $query = []): array { return $this->service->index($query); }
    public function store(array $payload): array { return $this->service->create($payload, (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
    public function update(array $payload): array { return $this->service->update((int) ($payload['escribano_id'] ?? 0), $payload, (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
}
