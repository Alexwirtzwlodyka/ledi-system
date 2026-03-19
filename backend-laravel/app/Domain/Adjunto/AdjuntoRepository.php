<?php
namespace App\Domain\Adjunto;

use App\Infrastructure\Database;

final class AdjuntoRepository
{
    public function __construct(private Database $db) {}

    public function all(): array
    {
        return array_map([$this, 'map'], $this->db->select('adjuntos', [], [], ['id ASC']));
    }

    public function create(array $data): array
    {
        return $this->map($this->db->insert('adjuntos', [
            'escribano_id' => (int) $data['escribano_id'],
            'nombre_original' => $data['nombre_original'],
            'mime_type' => $data['mime_type'],
            'tamano_bytes' => (int) $data['tamano_bytes'],
            'checksum_sha256' => $data['checksum_sha256'],
            'ciphertext' => $data['ciphertext'],
            'nonce' => $data['nonce'],
            'tag' => $data['tag'],
            'key_version' => (int) ($data['key_version'] ?? 1),
            'created_at' => gmdate('c'),
        ]));
    }

    public function find(int $id): ?array
    {
        $row = $this->db->firstBy('adjuntos', ['id = :id'], ['id' => $id]);
        return $row ? $this->map($row) : null;
    }

    public function listByEscribano(int $escribanoId): array
    {
        return array_map([$this, 'map'], $this->db->select(
            'adjuntos',
            ['escribano_id = :escribano_id'],
            ['escribano_id' => $escribanoId],
            ['id DESC']
        ));
    }

    private function map(array $row): array
    {
        $row['id'] = (int) $row['id'];
        $row['escribano_id'] = (int) $row['escribano_id'];
        $row['tamano_bytes'] = (int) $row['tamano_bytes'];
        $row['key_version'] = (int) $row['key_version'];
        return $row;
    }
}
