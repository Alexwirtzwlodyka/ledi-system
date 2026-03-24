<?php
namespace App\Domain\Libro;

final class LibroPolicy
{
    public function canUpload(array $actor): bool
    {
        return in_array(($actor['role'] ?? 'consulta'), ['admin', 'operador'], true);
    }

    public function requiresStepUpForDownload(array $actor): bool
    {
        return ($actor['role'] ?? 'consulta') === 'admin';
    }
}
