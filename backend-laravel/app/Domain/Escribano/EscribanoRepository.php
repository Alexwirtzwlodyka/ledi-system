<?php
namespace App\Domain\Escribano;

use App\Infrastructure\Database;

final class EscribanoRepository
{
    public function __construct(private Database $db) {}

    public function findByDni(string $dni): ?array
    {
        $normalizedDni = preg_replace('/\D+/', '', $dni);
        if ($normalizedDni === '') {
            return null;
        }

        $row = $this->db->firstBy('escribanos', ['dni = :dni'], ['dni' => $normalizedDni]);
        return $row ? $this->map($row) : null;
    }

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
            'email_personal' => strtolower(trim((string) ($data['email_personal'] ?? ''))),
            'email_laboral' => strtolower(trim((string) ($data['email_laboral'] ?? ''))),
            'direccion' => trim((string) ($data['direccion'] ?? '')),
            'direccion_domicilio' => trim((string) ($data['direccion_domicilio'] ?? '')),
            'direccion_estudio' => trim((string) ($data['direccion_estudio'] ?? '')),
            'direccion_domicilio_calle' => trim((string) ($data['direccion_domicilio_calle'] ?? '')),
            'direccion_domicilio_numeracion' => trim((string) ($data['direccion_domicilio_numeracion'] ?? '')),
            'direccion_domicilio_barrio' => trim((string) ($data['direccion_domicilio_barrio'] ?? '')),
            'direccion_estudio_calle' => trim((string) ($data['direccion_estudio_calle'] ?? '')),
            'direccion_estudio_numeracion' => trim((string) ($data['direccion_estudio_numeracion'] ?? '')),
            'direccion_estudio_barrio' => trim((string) ($data['direccion_estudio_barrio'] ?? '')),
            'localidad' => trim((string) ($data['localidad'] ?? '')),
            'provincia' => trim((string) ($data['provincia'] ?? '')),
            'fecha_nacimiento' => trim((string) ($data['fecha_nacimiento'] ?? '')),
            'fecha_egresado' => trim((string) ($data['fecha_egresado'] ?? '')),
            'fecha_matriculado' => trim((string) ($data['fecha_matriculado'] ?? '')),
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
        foreach (['email_personal', 'email_laboral'] as $field) {
            if (array_key_exists($field, $changes)) {
                $changes[$field] = strtolower(trim((string) $changes[$field]));
            }
        }
        foreach ([
            'telefono',
            'direccion',
            'direccion_domicilio',
            'direccion_estudio',
            'direccion_domicilio_calle',
            'direccion_domicilio_numeracion',
            'direccion_domicilio_barrio',
            'direccion_estudio_calle',
            'direccion_estudio_numeracion',
            'direccion_estudio_barrio',
            'localidad',
            'provincia',
            'fecha_nacimiento',
            'fecha_egresado',
            'fecha_matriculado',
            'estado',
            'observaciones',
        ] as $field) {
            if (array_key_exists($field, $changes)) {
                $changes[$field] = trim((string) $changes[$field]);
            }
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
