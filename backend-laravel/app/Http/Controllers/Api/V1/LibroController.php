<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\Libro\LibroService;

final class LibroController
{
    public function __construct(private LibroService $service) {}

    public function index(array $query): array { return $this->service->list((string) ($query['registro'] ?? '')); }
    public function store(array $payload): array { return $this->service->upload((string) ($payload['registro'] ?? ''), (string) ($payload['descripcion'] ?? ''), (string) ($payload['filename'] ?? ''), $this->normalizeContent($payload['content'] ?? ''), (string) ($payload['content_encoding'] ?? 'plain'), (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
    public function download(array $payload): array { return $this->service->download((int) ($payload['libro_id'] ?? 0), (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? [], (string) ($payload['step_up_token'] ?? ''), (string) ($payload['_ip'] ?? '127.0.0.1'), (string) ($payload['_user_agent'] ?? 'cli')); }

    private function normalizeContent(mixed $content): string
    {
        if (is_array($content)) {
            return implode("\n", array_map(static fn(mixed $line): string => (string) $line, $content));
        }

        return (string) $content;
    }
}
