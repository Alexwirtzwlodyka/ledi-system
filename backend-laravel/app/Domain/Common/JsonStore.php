<?php
namespace App\Domain\Common;

final class JsonStore
{
    public function __construct(private string $path)
    {
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        if (!file_exists($path)) {
            file_put_contents($path, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }

    public function all(): array
    {
        $content = file_get_contents($this->path);
        $decoded = json_decode($content ?: '[]', true);
        return is_array($decoded) ? $decoded : [];
    }

    public function write(array $records): void
    {
        file_put_contents($this->path, json_encode(array_values($records), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public function replaceAll(array $records): void
    {
        $this->write($records);
    }

    public function nextId(): int
    {
        $max = 0;
        foreach ($this->all() as $record) {
            $max = max($max, (int) ($record['id'] ?? 0));
        }
        return $max + 1;
    }
}
