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

    public function upload(int $escribanoId, string $fileName, string $content, string $contentEncoding = 'plain', int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canUpload($actor)) {
            return Response::error('No autorizado', 403);
        }
        if (!$this->escribanos->find($escribanoId)) {
            return Response::error('Escribano no encontrado', 404);
        }
        if (!str_ends_with(strtolower($fileName), '.pdf')) {
            return Response::error('Solo se permiten PDFs', 422);
        }

        $binaryContent = $this->decodeContent($content, $contentEncoding);
        if ($binaryContent === '') {
            return Response::error('El adjunto esta vacio o es invalido', 422);
        }

        $encrypted = $this->crypto->encrypt($binaryContent, $this->key, 'adjunto:' . $escribanoId);
        $item = $this->repo->create([
            'escribano_id' => $escribanoId,
            'nombre_original' => $fileName,
            'mime_type' => 'application/pdf',
            'tamano_bytes' => strlen($binaryContent),
            'checksum_sha256' => hash('sha256', $binaryContent),
            'ciphertext' => $encrypted['ciphertext'],
            'nonce' => $encrypted['nonce'],
            'tag' => $encrypted['tag'],
            'key_version' => 1,
        ]);
        $this->audit->log('ADJUNTO_UPLOADED', 'adjunto', (int) $item['id'], ['escribano_id' => $escribanoId, 'filename' => $fileName], $actorUserId ?: null);
        return Response::success(['item' => $item], 201);
    }

    public function list(int $escribanoId = 0): array
    {
        $items = $escribanoId > 0
            ? $this->repo->listByEscribano($escribanoId)
            : $this->repo->all();

        return Response::success(['items' => $items, 'total' => count($items)]);
    }

    public function update(int $adjuntoId, string $fileName, string $content, string $contentEncoding = 'plain', int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canUpload($actor)) {
            return Response::error('No autorizado', 403);
        }

        $item = $this->repo->find($adjuntoId);
        if (!$item) {
            return Response::error('Adjunto no encontrado', 404);
        }
        if (!str_ends_with(strtolower($fileName), '.pdf')) {
            return Response::error('Solo se permiten PDFs', 422);
        }

        $binaryContent = $this->decodeContent($content, $contentEncoding);
        if ($binaryContent === '') {
            return Response::error('El adjunto esta vacio o es invalido', 422);
        }

        $encrypted = $this->crypto->encrypt($binaryContent, $this->key, 'adjunto:' . $item['escribano_id']);
        $updated = $this->repo->update($adjuntoId, [
            'nombre_original' => $fileName,
            'mime_type' => 'application/pdf',
            'tamano_bytes' => strlen($binaryContent),
            'checksum_sha256' => hash('sha256', $binaryContent),
            'ciphertext' => $encrypted['ciphertext'],
            'nonce' => $encrypted['nonce'],
            'tag' => $encrypted['tag'],
            'key_version' => 1,
        ]);
        if (!$updated) {
            return Response::error('Adjunto no encontrado', 404);
        }

        $this->audit->log('ADJUNTO_UPDATED', 'adjunto', $adjuntoId, ['escribano_id' => $item['escribano_id'], 'filename' => $fileName], $actorUserId ?: null);
        return Response::success(['item' => $updated]);
    }

    public function download(int $adjuntoId, int $actorUserId = 0, array $actor = [], string $stepUpToken = '', string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        $item = $this->repo->find($adjuntoId);
        if (!$item) {
            return Response::error('Adjunto no encontrado', 404);
        }
        if ($this->policy->requiresStepUpForDownload($actor)) {
            if ($stepUpToken === '' || !$this->auth->consumeStepUp($stepUpToken, $actorUserId, $ip, $userAgent)) {
                return Response::error('Step-up requerido o invalido', 403);
            }
        }
        $plain = $this->crypto->decrypt([
            'ciphertext' => $item['ciphertext'],
            'nonce' => $item['nonce'],
            'tag' => $item['tag'],
        ], $this->key, 'adjunto:' . $item['escribano_id']);
        $this->audit->log('ADJUNTO_DOWNLOADED', 'adjunto', (int) $item['id'], ['escribano_id' => $item['escribano_id']], $actorUserId ?: null);
        return Response::success([
            'filename' => $item['nombre_original'],
            'mime_type' => $item['mime_type'],
            'content' => base64_encode($plain),
            'content_encoding' => 'base64',
        ]);
    }

    private function decodeContent(string $content, string $contentEncoding): string
    {
        if ($contentEncoding !== 'base64') {
            return $content;
        }

        $decoded = base64_decode($content, true);
        return $decoded === false ? '' : $decoded;
    }
}
