<?php
namespace App\Domain\Escribano;

final class EscribanoPolicy
{
    public function canWrite(array $actor): bool
    {
        return in_array(($actor['role'] ?? 'consulta'), ['admin', 'operador'], true);
    }
}
