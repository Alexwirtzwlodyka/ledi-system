<?php
namespace App\Support;

final class PdfCryptoService
{
    public function encrypt(string $content, string $key, string $aad = ''): array
    {
        $nonce = random_bytes(12);
        $ciphertext = openssl_encrypt($content, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag, $aad);

        if ($ciphertext === false) {
            throw new \RuntimeException('No se pudo cifrar el adjunto');
        }

        return [
            'ciphertext' => base64_encode($ciphertext),
            'nonce' => base64_encode($nonce),
            'tag' => base64_encode($tag),
        ];
    }

    public function decrypt(array $payload, string $key, string $aad = ''): string
    {
        $plain = openssl_decrypt(
            base64_decode($payload['ciphertext'], true),
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            base64_decode($payload['nonce'], true),
            base64_decode($payload['tag'], true),
            $aad,
        );

        if ($plain === false) {
            throw new \RuntimeException('No se pudo descifrar el adjunto');
        }

        return $plain;
    }
}
