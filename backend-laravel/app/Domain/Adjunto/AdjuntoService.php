<?php
namespace App\Domain\Adjunto;

use App\Domain\Auth\AuthService;
use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;
use App\Domain\Escribano\EscribanoRepository;
use App\Support\PdfCryptoService;

final class AdjuntoService
{
    public function __construct(
        private AdjuntoRepository $repo,
        private EscribanoRepository $escribanos,
        private PdfCryptoService $crypto,
        private AuditLogger $audit,
        private string $key,
        private AdjuntoPolicy $policy,
        private AuthService $auth,
    ) {}

    public function upload(int $escribanoId, string $fileName, string $content, int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canUpload($actor)) {
            return Response::error('No autorizado', 403);
        }
        if (!$this->escribanos->find($escribanoId)) {
            return Response::error('Escribano no encontrado', 404);
        }
        if (!str_ends_with(strtolower($fileName), '.pdf')) {
            return Response::error('Sólo se permiten PDFs', 422);
        }
        $encrypted = $this->crypto->encrypt($content, $this->key, 'adjunto:' . $escribanoId);
        $item = $this->repo->create([
            'escribano_id' => $escribanoId,
            'nombre_original' => $fileName,
            'mime_type' => 'application/pdf',
            'tamano_bytes' => strlen($content),
            'checksum_sha256' => hash('sha256', $content),
            'ciphertext' => $encrypted['ciphertext'],
            'nonce' => $encrypted['nonce'],
            'tag' => $encrypted['tag'],
            'key_version' => 1,
        ]);
        $this->audit->log('ADJUNTO_UPLOADED', 'adjunto', (int) $item['id'], ['escribano_id' => $escribanoId, 'filename' => $fileName], $actorUserId ?: null);
        return Response::success(['item' => $item], 201);
    }

    public function listByEscribano(int $escribanoId): array
    {
        return Response::success(['items' => $this->repo->listByEscribano($escribanoId)]);
    }

    public function download(int $adjuntoId, int $actorUserId = 0, array $actor = [], string $stepUpToken = '', string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        $item = $this->repo->find($adjuntoId);
        if (!$item) {
            return Response::error('Adjunto no encontrado', 404);
        }
        if ($this->policy->requiresStepUpForDownload($actor)) {
            if ($stepUpToken === '' || !$this->auth->consumeStepUp($stepUpToken, $actorUserId, $ip, $userAgent)) {
                return Response::error('Step-up requerido o inválido', 403);
            }
        }
        $plain = $this->crypto->decrypt([
            'ciphertext' => $item['ciphertext'],
            'nonce' => $item['nonce'],
            'tag' => $item['tag'],
        ], $this->key, 'adjunto:' . $item['escribano_id']);
        $this->audit->log('ADJUNTO_DOWNLOADED', 'adjunto', (int) $item['id'], ['escribano_id' => $item['escribano_id']], $actorUserId ?: null);
        return Response::success(['filename' => $item['nombre_original'], 'content' => $plain]);
    }
}
