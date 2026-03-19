<?php
namespace App\Http\Controllers\Api\V1;

use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;

final class AuditController
{
    public function __construct(private AuditLogger $audit) {}

    public function index(array $query = []): array
    {
        $items = $this->audit->all($query);
        return Response::success(['items' => $items, 'total' => count($items)]);
    }
}
