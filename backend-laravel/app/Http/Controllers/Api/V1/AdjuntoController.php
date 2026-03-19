<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\Adjunto\AdjuntoService;

final class AdjuntoController
{
    public function __construct(private AdjuntoService $service) {}

    public function index(array $query): array { return $this->service->list((int) ($query['escribano_id'] ?? 0)); }
    public function store(array $payload): array { return $this->service->upload((int) ($payload['escribano_id'] ?? 0), (string) ($payload['filename'] ?? ''), $this->normalizeContent($payload['content'] ?? ''), (string) ($payload['content_encoding'] ?? 'plain'), (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? []); }
    public function download(array $payload): array { return $this->service->download((int) ($payload['adjunto_id'] ?? 0), (int) ($payload['actor_user_id'] ?? 0), $payload['_actor'] ?? [], (string) ($payload['step_up_token'] ?? ''), (string) ($payload['_ip'] ?? '127.0.0.1'), (string) ($payload['_user_agent'] ?? 'cli')); }

    private function normalizeContent(mixed $content): string
    {
        if (is_array($content)) {
            return implode("\n", array_map(static fn(mixed $line): string => (string) $line, $content));
        }

        return (string) $content;
    }
}
