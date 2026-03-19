<?php
namespace App\Domain\Common;

final class Response
{
    public static function success(array $data = [], int $status = 200): array
    {
        return ['ok' => true, 'status' => $status, 'data' => $data];
    }

    public static function error(string $message, int $status = 400, array $errors = []): array
    {
        return ['ok' => false, 'status' => $status, 'message' => $message, 'errors' => $errors];
    }
}
