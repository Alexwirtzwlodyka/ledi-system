<?php
namespace App\Domain\Libro;

use App\Infrastructure\Database;

final class LibroRepository
{
    public function __construct(private Database $db) {}

    public function all(string $registro = ''): array
    {
        $conditions = [];
        $params = [];
        if (trim($registro) !== '') {
            $conditions[] = 'registro = :registro';
            $params['registro'] = trim($registro);
        }

        return array_map([$this, 'map'], $this->db->select('libros', $conditions, $params, ['id DESC']));
    }

    public function create(array $data): array
    {
        return $this->map($this->db->insert('libros', [
            'registro' => trim((string) $data['registro']),
            'descripcion' => trim((string) ($data['descripcion'] ?? '')),
            'nombre_original' => (string) $data['nombre_original'],
            'mime_type' => (string) $data['mime_type'],
            'tamano_bytes' => (int) $data['tamano_bytes'],
            'checksum_sha256' => (string) $data['checksum_sha256'],
            'ciphertext' => (string) $data['ciphertext'],
            'nonce' => (string) $data['nonce'],
            'tag' => (string) $data['tag'],
            'key_version' => (int) ($data['key_version'] ?? 1),
            'created_at' => gmdate('c'),
        ]));
    }

    public function find(int $id): ?array
    {
        $row = $this->db->firstBy('libros', ['id = :id'], ['id' => $id]);
        return $row ? $this->map($row) : null;
    }

    private function map(array $row): array
    {
        $row['id'] = (int) $row['id'];
        $row['tamano_bytes'] = (int) $row['tamano_bytes'];
        $row['key_version'] = (int) $row['key_version'];
        return $row;
    }
}
