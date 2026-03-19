<?php
namespace App\Services;

class EscribanoService {
    public function index(): array {
        return [
            ['id' => 1, 'apellido' => 'Pérez', 'nombre' => 'Ana', 'dni' => '30111222', 'matricula' => '120', 'registro' => 'A-12'],
            ['id' => 2, 'apellido' => 'Gómez', 'nombre' => 'Luis', 'dni' => '28999111', 'matricula' => '121', 'registro' => 'B-04'],
        ];
    }
    public function store(array $data): array { $data['id'] = 500; return $data; }
}
