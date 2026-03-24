<?php
namespace App\Domain\Escribano;

use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;

final class EscribanoService
{
    public function __construct(private EscribanoRepository $repo, private AuditLogger $audit, private EscribanoPolicy $policy) {}

    public function index(array $filters = []): array
    {
        $items = $this->repo->all($filters);
        return Response::success(['items' => $items, 'total' => count($items)]);
    }

    public function create(array $payload, int $actorUserId = 0, array $actor = []): array
    {
        if ($actorUserId !== 0 && !$this->policy->canCreate($actor)) {
            return Response::error('No autorizado', 403);
        }
        $required = ['apellido', 'nombre'];
        $errors = [];
        foreach ($required as $field) {
            if (trim((string) ($payload[$field] ?? '')) === '') {
                $errors[$field] = 'Obligatorio';
            }
        }
        $dni = preg_replace('/\D+/', '', (string) ($payload['dni'] ?? ''));
        if ($dni === '') {
            $errors['dni'] = 'Obligatorio';
        } elseif ($this->repo->findByDni($dni) !== null) {
            $errors['dni'] = 'Ya existe un escribano con ese DNI';
        }
        if ($errors !== []) {
            return Response::error('Datos invalidos', 422, $errors);
        }
        $item = $this->repo->create($payload);
        $this->audit->log('ESCRIBANO_CREATED', 'escribano', (int) $item['id'], ['apellido' => $item['apellido']], $actorUserId ?: null);
        return Response::success(['item' => $item], 201);
    }

    public function update(int $id, array $payload, int $actorUserId = 0, array $actor = []): array
    {
        if (!$this->policy->canEdit($actor)) {
            return Response::error('No autorizado', 403);
        }
        $changes = [];
        foreach ([
            'email_personal',
            'email_laboral',
            'telefono',
            'direccion_domicilio',
            'direccion_estudio',
            'direccion_domicilio_calle',
            'direccion_domicilio_numeracion',
            'direccion_domicilio_barrio',
            'direccion_estudio_calle',
            'direccion_estudio_numeracion',
            'direccion_estudio_barrio',
            'localidad',
        ] as $field) {
            if (array_key_exists($field, $payload)) {
                $changes[$field] = is_string($payload[$field]) ? trim($payload[$field]) : $payload[$field];
            }
        }
        if ($changes === []) {
            return Response::error('Sin cambios', 422);
        }
        $item = $this->repo->update($id, $changes);
        if (!$item) {
            return Response::error('Escribano no encontrado', 404);
        }
        $this->audit->log('ESCRIBANO_UPDATED', 'escribano', $id, ['fields' => array_keys($changes)], $actorUserId ?: null);
        return Response::success(['item' => $item]);
    }
}
