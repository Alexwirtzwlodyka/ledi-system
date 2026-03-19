<?php
namespace App\Http\Requests\Escribano;

class StoreEscribanoRequest {
    public function __construct(private array $data) {}
    public function validated(): array {
        return [
            'apellido' => trim((string)($this->data['apellido'] ?? '')),
            'nombre' => trim((string)($this->data['nombre'] ?? '')),
            'dni' => preg_replace('/\D+/', '', (string)($this->data['dni'] ?? '')),
            'matricula' => trim((string)($this->data['matricula'] ?? '')),
            'registro' => trim((string)($this->data['registro'] ?? '')),
            'email' => strtolower(trim((string)($this->data['email'] ?? ''))),
        ];
    }
}
