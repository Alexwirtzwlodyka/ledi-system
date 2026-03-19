<?php
namespace App\Domain\Common;

final class Router
{
    public function __construct(private array $routes, private array $controllers) {}

    public function dispatch(string $method, string $uri, array $payload = [], ?string $token = null): array
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $query = [];
        parse_str((string) parse_url($uri, PHP_URL_QUERY), $query);
        $payload = array_merge($query, $payload);

        $isProtected = true;
        $match = $this->match($this->routes['public'] ?? [], $method, $path);
        if ($match === null) {
            $match = $this->match($this->routes['protected'] ?? [], $method, $path);
        } else {
            $isProtected = false;
        }
        if ($match === null) {
            return Response::error('Ruta no encontrada', 404);
        }

        $payload = array_merge($match['params'] ?? [], $payload);

        if ($isProtected) {
            $session = $this->controllers['auth']->resolveSession($token ?? '');
            if (!$session) {
                return Response::error('No autenticado', 401);
            }
            $payload['actor_user_id'] = $session['user_id'];
            $payload['_actor'] = $session['user'];
            $payload['_ip'] = $payload['_ip'] ?? '127.0.0.1';
            $payload['_user_agent'] = $payload['_user_agent'] ?? 'http-client';
            $payload['token'] = $token ?? '';
        }

        [$key, $action] = $match['handler'];
        $call = [$this->controllers[$key], $action];
        return $call($payload);
    }

    private function match(array $routes, string $method, string $path): ?array
    {
        foreach ($routes as $route) {
            if (strtoupper($route['method']) !== strtoupper($method)) {
                continue;
            }
            $params = [];
            $pattern = preg_replace_callback('/\{([^}]+)\}/', function ($m) use (&$params) {
                $params[] = $m[1];
                return '([^/]+)';
            }, $route['uri']);
            if (!preg_match('#^' . $pattern . '$#', $path, $m)) {
                continue;
            }
            array_shift($m);
            return [
                'handler' => $route['handler'],
                'params' => array_combine($params, $m) ?: [],
            ];
        }
        return null;
    }
}
