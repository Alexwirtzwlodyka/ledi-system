<?php

return [
    'public' => [
        ['method' => 'POST', 'uri' => '/api/v1/auth/login', 'handler' => ['auth', 'login']],
        ['method' => 'POST', 'uri' => '/api/v1/auth/step-up', 'handler' => ['auth', 'stepUp']],
    ],
    'protected' => [
        ['method' => 'POST', 'uri' => '/api/v1/auth/logout', 'handler' => ['auth', 'logout']],
        ['method' => 'GET', 'uri' => '/api/v1/users', 'handler' => ['users', 'index']],
        ['method' => 'POST', 'uri' => '/api/v1/users', 'handler' => ['users', 'store']],
        ['method' => 'PATCH', 'uri' => '/api/v1/users', 'handler' => ['users', 'update']],
        ['method' => 'POST', 'uri' => '/api/v1/users/disable', 'handler' => ['users', 'disable']],
        ['method' => 'GET', 'uri' => '/api/v1/escribanos', 'handler' => ['escribanos', 'index']],
        ['method' => 'POST', 'uri' => '/api/v1/escribanos', 'handler' => ['escribanos', 'store']],
        ['method' => 'PATCH', 'uri' => '/api/v1/escribanos', 'handler' => ['escribanos', 'update']],
        ['method' => 'GET', 'uri' => '/api/v1/adjuntos', 'handler' => ['adjuntos', 'index']],
        ['method' => 'POST', 'uri' => '/api/v1/adjuntos', 'handler' => ['adjuntos', 'store']],
        ['method' => 'POST', 'uri' => '/api/v1/adjuntos/download', 'handler' => ['adjuntos', 'download']],
        ['method' => 'GET', 'uri' => '/api/v1/audit', 'handler' => ['audit', 'index']],
    ],
];
