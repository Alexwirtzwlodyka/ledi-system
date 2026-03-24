<?php
namespace App\Domain\Libro;

use App\Domain\Auth\AuthService;
use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;
use App\Domain\Escribano\EscribanoRepository;
use App\Support\PdfCryptoService;

final class LibroService
{
    public function __construct(
        private LibroRepository $repo,
        private EscribanoRepository $escribanos,
        private PdfCryptoService $crypto,
        private AuditLogger $audit,
        private string $key,
        private LibroPolicy $policy,
        private AuthService $auth,
    ) {}

    public function list(string $registro = ''): array
    {
        $items = $this->repo->all($registro);
        return Response::success(['items' => $items, 'total' => count($items)]);
    }

    public function upload(string $registro, string $descripcion, string $fileName, string $content, string $contentEncoding = 'plain', int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canUpload($actor)) {
            return Response::error('No autorizado', 403);
        }

        $registro = trim($registro);
        if ($registro === '') {
            return Response::error('El registro es obligatorio', 422);
        }
        if (!$this->existsRegistro($registro)) {
            return Response::error('El registro no existe', 404);
        }
        if (!str_ends_with(strtolower($fileName), '.pdf')) {
            return Response::error('Solo se permiten PDFs', 422);
        }

        $binaryContent = $this->decodeContent($content, $contentEncoding);
        if ($binaryContent === '') {
            return Response::error('El libro esta vacio o es invalido', 422);
        }

        $encrypted = $this->crypto->encrypt($binaryContent, $this->key, 'libro:' . $registro);
        $item = $this->repo->create([
            'registro' => $registro,
            'descripcion' => $descripcion,
            'nombre_original' => $fileName,
            'mime_type' => 'application/pdf',
            'tamano_bytes' => strlen($binaryContent),
            'checksum_sha256' => hash('sha256', $binaryContent),
            'ciphertext' => $encrypted['ciphertext'],
            'nonce' => $encrypted['nonce'],
            'tag' => $encrypted['tag'],
            'key_version' => 1,
        ]);
        $this->audit->log('LIBRO_UPLOADED', 'libro', (int) $item['id'], ['registro' => $registro, 'filename' => $fileName], $actorUserId ?: null);
        return Response::success(['item' => $item], 201);
    }

    public function download(int $libroId, int $actorUserId = 0, array $actor = [], string $stepUpToken = '', string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        $item = $this->repo->find($libroId);
        if (!$item) {
            return Response::error('Libro no encontrado', 404);
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
        ], $this->key, 'libro:' . $item['registro']);

        $this->audit->log('LIBRO_DOWNLOADED', 'libro', (int) $item['id'], ['registro' => $item['registro']], $actorUserId ?: null);
        return Response::success([
            'filename' => $item['nombre_original'],
            'mime_type' => $item['mime_type'],
            'content' => base64_encode($plain),
            'content_encoding' => 'base64',
        ]);
    }

    private function existsRegistro(string $registro): bool
    {
        foreach ($this->escribanos->all() as $escribano) {
            if (trim((string) ($escribano['registro'] ?? '')) === $registro) {
                return true;
            }
        }

        return false;
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
