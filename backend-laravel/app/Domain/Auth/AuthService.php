<?php
namespace App\Domain\Auth;

use App\Domain\Common\AuditLogger;
use App\Domain\Common\Response;
use App\Domain\Escribano\EscribanoRepository;
use App\Domain\User\UserRepository;

final class AuthService
{
    public function __construct(
        private UserRepository $users,
        private EscribanoRepository $escribanos,
        private PasswordHasher $hasher,
        private SessionManager $sessions,
        private AuditLogger $audit,
        private AuthRateLimiter $rateLimiter,
        private StepUpService $stepUp,
    ) {}

    public function login(string $username, string $password, string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        $rateKey = strtolower(trim($username)) . '|' . $ip;
        if ($this->rateLimiter->tooManyAttempts($rateKey)) {
            return Response::error('Demasiados intentos de acceso', 429);
        }

        $user = $this->users->findByUsername($username);
        if (!$user || !$this->hasher->verify($password, $user['password_hash'])) {
            $this->rateLimiter->hit($rateKey);
            $this->audit->log('LOGIN_FAILED', 'user', (int) ($user['id'] ?? 0), ['username' => $username], $user['id'] ?? null);
            return Response::error('Credenciales invalidas', 401);
        }
        if (!($user['is_active'] ?? false)) {
            return Response::error('Usuario inactivo', 403);
        }

        $this->rateLimiter->clear($rateKey);
        $session = $this->sessions->create((int) $user['id'], $ip, $userAgent);
        $this->audit->log('LOGIN_SUCCESS', 'user', (int) $user['id'], ['session_id' => $session['id']], (int) $user['id']);
        return Response::success([
            'token' => $session['token'],
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'must_change_password' => (bool) ($user['must_change_password'] ?? false),
            ],
        ]);
    }

    public function stepUp(string $username, string $password, string $ip = '127.0.0.1', string $userAgent = 'cli'): array
    {
        $user = $this->users->findByUsername($username);
        if (!$user || !$this->hasher->verify($password, $user['password_hash']) || !($user['is_active'] ?? false)) {
            return Response::error('Credenciales invalidas para step-up', 401);
        }
        $token = $this->stepUp->issue((int) $user['id'], $ip, $userAgent);
        $this->audit->log('STEP_UP_ISSUED', 'user', (int) $user['id'], ['step_up_id' => $token['id']], (int) $user['id']);
        return Response::success(['step_up_token' => $token['token'], 'expires_at' => $token['expires_at']]);
    }

    public function logout(string $token): array
    {
        $this->sessions->revokeByToken($token);
        return Response::success(['message' => 'Sesion cerrada']);
    }

    public function activePresence(): array
    {
        $activeUsers = [];
        $linkedEscribanos = [];

        foreach ($this->sessions->active() as $session) {
            $userId = (int) ($session['user_id'] ?? 0);
            if ($userId <= 0 || isset($activeUsers[$userId])) {
                continue;
            }

            $user = $this->users->find($userId);
            if (!$user || !($user['is_active'] ?? false)) {
                continue;
            }

            unset($user['password_hash']);
            $user['login_at'] = (string) ($session['login_at'] ?? '');
            $activeUsers[$userId] = $user;

            $escribanoId = (int) ($user['escribano_id_vinculado'] ?? 0);
            if ($escribanoId > 0 && !isset($linkedEscribanos[$escribanoId])) {
                $escribano = $this->escribanos->find($escribanoId);
                if ($escribano) {
                    $linkedEscribanos[$escribanoId] = $escribano;
                }
            }
        }

        return Response::success([
            'users' => array_values($activeUsers),
            'escribanos' => array_values($linkedEscribanos),
            'users_total' => count($activeUsers),
            'escribanos_total' => count($linkedEscribanos),
        ]);
    }

    public function resolveSession(string $token): ?array
    {
        $session = $this->sessions->findActiveByToken($token);
        if (!$session) {
            return null;
        }
        $user = $this->users->find((int) $session['user_id']);
        if (!$user || !($user['is_active'] ?? false)) {
            return null;
        }
        unset($user['password_hash']);
        return ['user_id' => $user['id'], 'user' => $user, 'session' => $session];
    }

    public function consumeStepUp(string $token, int $userId, string $ip, string $userAgent): bool
    {
        return $this->stepUp->consume($token, $userId, $ip, $userAgent);
    }
}
