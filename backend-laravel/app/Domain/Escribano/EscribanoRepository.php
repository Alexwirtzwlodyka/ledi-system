<?php
namespace App\Domain\Escribano;

use App\Infrastructure\Database;

final class EscribanoRepository
{
    public function __construct(private Database $db) {}

    public function all(array $filters = []): array
    {
        $search = strtolower(trim((string) ($filters['search'] ?? '')));
        $estado = trim((string) ($filters['estado'] ?? ''));
        $localidad = strtolower(trim((string) ($filters['localidad'] ?? '')));
        $dni = preg_replace('/\D+/', '', (string) ($filters['dni'] ?? ''));
        $matricula = trim((string) ($filters['matricula'] ?? ''));
        $conditions = [];
        $params = [];

        if ($search !== '') {
            $conditions[] = "LOWER(COALESCE(apellido, '') || ' ' || COALESCE(nombre, '') || ' ' || COALESCE(dni, '') || ' ' || COALESCE(matricula, '')) LIKE :search";
            $params['search'] = '%' . $search . '%';
        }

        if ($estado !== '') {
            $conditions[] = 'estado = :estado';
            $params['estado'] = $estado;
        }

        if ($localidad !== '') {
            $conditions[] = "LOWER(COALESCE(localidad, '')) LIKE :localidad";
            $params['localidad'] = '%' . $localidad . '%';
        }

        if ($dni !== '') {
            $conditions[] = 'dni = :dni';
            $params['dni'] = $dni;
        }

        if ($matricula !== '') {
            $conditions[] = 'matricula = :matricula';
            $params['matricula'] = $matricula;
        }

        return array_map([$this, 'map'], $this->db->select(
            'escribanos',
            $conditions,
            $params,
            ['apellido ASC', 'nombre ASC', 'id ASC']
        ));
    }

    public function find(int $id): ?array
    {
        $row = $this->db->firstBy('escribanos', ['id = :id'], ['id' => $id]);
        return $row ? $this->map($row) : null;
    }

    public function create(array $data): array
    {
        return $this->map($this->db->insert('escribanos', [
            'apellido' => trim((string) $data['apellido']),
            'nombre' => trim((string) $data['nombre']),
            'dni' => preg_replace('/\D+/', '', (string) ($data['dni'] ?? '')),
            'matricula' => trim((string) ($data['matricula'] ?? '')),
            'registro' => trim((string) ($data['registro'] ?? '')),
            'tipo_escribano' => $data['tipo_escribano'] ?? 'titular',
            'telefono' => trim((string) ($data['telefono'] ?? '')),
            'email' => strtolower(trim((string) ($data['email'] ?? ''))),
            'direccion' => trim((string) ($data['direccion'] ?? '')),
            'localidad' => trim((string) ($data['localidad'] ?? '')),
            'provincia' => trim((string) ($data['provincia'] ?? '')),
            'estado' => $data['estado'] ?? 'activo',
            'observaciones' => trim((string) ($data['observaciones'] ?? '')),
            'created_at' => gmdate('c'),
            'updated_at' => gmdate('c'),
        ]));
    }

    public function update(int $id, array $changes): ?array
    {
        if (array_key_exists('dni', $changes)) {
            $changes['dni'] = preg_replace('/\D+/', '', (string) $changes['dni']);
        }
        if (array_key_exists('email', $changes)) {
            $changes['email'] = strtolower(trim((string) $changes['email']));
        }
        $changes['updated_at'] = gmdate('c');

        $updated = $this->db->updateById('escribanos', $id, $changes);
        return $updated ? $this->map($updated) : null;
    }

    private function map(array $row): array
    {
        $row['id'] = (int) $row['id'];
        return $row;
    }
}
