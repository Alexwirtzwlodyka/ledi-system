<?php
namespace App\Infrastructure;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    private const TABLES = [
        'users' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(190) NOT NULL UNIQUE,
    celular VARCHAR(60) NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'username' => 'string',
                'email' => 'string',
                'celular' => 'string',
                'password_hash' => 'string',
                'role' => 'string',
                'is_active' => 'bool',
                'must_change_password' => 'bool',
                'created_at' => 'string',
                'updated_at' => 'string',
            ],
            'alter' => [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS celular VARCHAR(60) NOT NULL DEFAULT ''",
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
                'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)',
                'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                'CREATE INDEX IF NOT EXISTS idx_users_celular ON users(celular)',
            ],
        ],
        'sessions' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(80) NOT NULL UNIQUE,
    ip VARCHAR(64) NOT NULL,
    user_agent TEXT NOT NULL,
    login_at TEXT NOT NULL,
    revoked_at TEXT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'user_id' => 'int',
                'token' => 'string',
                'ip' => 'string',
                'user_agent' => 'string',
                'login_at' => 'string',
                'revoked_at' => 'string',
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at)',
            ],
        ],
        'step_up_tokens' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS step_up_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    ip VARCHAR(64) NOT NULL,
    user_agent TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    used_at TEXT NULL,
    created_at TEXT NOT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'user_id' => 'int',
                'token' => 'string',
                'ip' => 'string',
                'user_agent' => 'string',
                'expires_at' => 'int',
                'used_at' => 'string',
                'created_at' => 'string',
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_step_up_tokens_user_id ON step_up_tokens(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_step_up_tokens_expires_at ON step_up_tokens(expires_at)',
            ],
        ],
        'audit_logs' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_id VARCHAR(80) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TEXT NOT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'actor_user_id' => 'int',
                'action' => 'string',
                'target_type' => 'string',
                'target_id' => 'string',
                'metadata' => 'json',
                'created_at' => 'string',
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
                'CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type)',
                'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
            ],
        ],
        'escribanos' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS escribanos (
    id BIGSERIAL PRIMARY KEY,
    apellido VARCHAR(120) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    matricula VARCHAR(30) NOT NULL,
    registro VARCHAR(30) NOT NULL,
    tipo_escribano VARCHAR(30) NOT NULL,
    telefono VARCHAR(60) NOT NULL DEFAULT '',
    email VARCHAR(190) NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT '',
    localidad VARCHAR(120) NOT NULL DEFAULT '',
    provincia VARCHAR(120) NOT NULL DEFAULT '',
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    observaciones TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'apellido' => 'string',
                'nombre' => 'string',
                'dni' => 'string',
                'matricula' => 'string',
                'registro' => 'string',
                'tipo_escribano' => 'string',
                'telefono' => 'string',
                'email' => 'string',
                'direccion' => 'string',
                'localidad' => 'string',
                'provincia' => 'string',
                'estado' => 'string',
                'observaciones' => 'string',
                'created_at' => 'string',
                'updated_at' => 'string',
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_escribanos_dni ON escribanos(dni)',
                'CREATE INDEX IF NOT EXISTS idx_escribanos_matricula ON escribanos(matricula)',
                'CREATE INDEX IF NOT EXISTS idx_escribanos_estado ON escribanos(estado)',
                'CREATE INDEX IF NOT EXISTS idx_escribanos_localidad ON escribanos(localidad)',
            ],
        ],
        'adjuntos' => [
            'ddl' => <<<'SQL'
CREATE TABLE IF NOT EXISTS adjuntos (
    id BIGSERIAL PRIMARY KEY,
    escribano_id BIGINT NOT NULL REFERENCES escribanos(id) ON DELETE CASCADE,
    nombre_original VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    ciphertext TEXT NOT NULL,
    nonce TEXT NOT NULL,
    tag TEXT NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
)
SQL,
            'columns' => [
                'id' => 'int',
                'escribano_id' => 'int',
                'nombre_original' => 'string',
                'mime_type' => 'string',
                'tamano_bytes' => 'int',
                'checksum_sha256' => 'string',
                'ciphertext' => 'string',
                'nonce' => 'string',
                'tag' => 'string',
                'key_version' => 'int',
                'created_at' => 'string',
            ],
            'indexes' => [
                'CREATE INDEX IF NOT EXISTS idx_adjuntos_escribano_id ON adjuntos(escribano_id)',
                'CREATE INDEX IF NOT EXISTS idx_adjuntos_checksum_sha256 ON adjuntos(checksum_sha256)',
            ],
        ],
    ];

    private PDO $pdo;
    private string $schema;

    public function __construct(private string $storagePath)
    {
        $this->schema = $this->resolveSchemaName($storagePath);
        $this->pdo = $this->connect();
        $this->pdo->exec('CREATE SCHEMA IF NOT EXISTS ' . $this->quoteIdentifier($this->schema));
        $this->pdo->exec('SET search_path TO ' . $this->quoteIdentifier($this->schema));
    }

    public function path(): string
    {
        return sprintf(
            'pgsql://%s:%s/%s?schema=%s',
            $this->config('DB_HOST', 'postgres'),
            $this->config('DB_PORT', '5432'),
            $this->config('DB_DATABASE', 'ledi'),
            $this->schema
        );
    }

    public function ensureTable(string $table): void
    {
        $definition = self::TABLES[$table] ?? null;
        if ($definition === null) {
            throw new RuntimeException("Tabla no soportada: {$table}");
        }

        $this->pdo->exec($definition['ddl']);
        foreach ($definition['alter'] ?? [] as $alterSql) {
            $this->pdo->exec($alterSql);
        }
        foreach ($definition['indexes'] as $indexSql) {
            $this->pdo->exec($indexSql);
        }
    }

    public function all(string $table): array
    {
        return $this->select($table);
    }

    public function replace(string $table, array $rows): void
    {
        $this->ensureTable($table);
        $this->pdo->beginTransaction();
        try {
            $this->pdo->exec('TRUNCATE TABLE ' . $this->quoteIdentifier($table) . ' RESTART IDENTITY CASCADE');
            foreach (array_values($rows) as $row) {
                $this->insert($table, $row);
            }
            $this->pdo->commit();
        } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    public function nextId(string $table): int
    {
        $this->ensureTable($table);
        $statement = $this->pdo->query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ' . $this->quoteIdentifier($table));
        $value = $statement ? $statement->fetchColumn() : 1;
        return (int) $value;
    }

    public function insert(string $table, array $row): array
    {
        $this->ensureTable($table);
        $definition = self::TABLES[$table];
        $payload = $this->serializeRow($table, $row);
        $columns = array_keys(array_intersect_key($payload, $definition['columns']));

        if ($columns === []) {
            $statement = $this->pdo->query('INSERT INTO ' . $this->quoteIdentifier($table) . ' DEFAULT VALUES RETURNING *');
            $inserted = $statement ? $statement->fetch(PDO::FETCH_ASSOC) : [];
            return $this->deserializeRow($table, is_array($inserted) ? $inserted : []);
        }

        $columnSql = implode(', ', array_map([$this, 'quoteIdentifier'], $columns));
        $valueSql = implode(', ', array_map(fn(string $column): string => ':' . $column, $columns));
        $statement = $this->pdo->prepare(
            'INSERT INTO ' . $this->quoteIdentifier($table) . " ({$columnSql}) VALUES ({$valueSql}) RETURNING *"
        );

        foreach ($columns as $column) {
            $this->bindValue($statement, $column, $payload[$column], $definition['columns'][$column]);
        }

        $statement->execute();
        $inserted = $statement->fetch(PDO::FETCH_ASSOC);
        return $this->deserializeRow($table, is_array($inserted) ? $inserted : []);
    }

    public function select(string $table, array $conditions = [], array $params = [], array $orderBy = ['id ASC'], ?int $limit = null): array
    {
        $this->ensureTable($table);
        $sql = 'SELECT * FROM ' . $this->quoteIdentifier($table);
        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        if ($orderBy !== []) {
            $sql .= ' ORDER BY ' . implode(', ', $orderBy);
        }
        if ($limit !== null) {
            $sql .= ' LIMIT ' . max(1, $limit);
        }

        $statement = $this->pdo->prepare($sql);
        foreach ($params as $name => $value) {
            $this->bindDynamicValue($statement, (string) $name, $value);
        }
        $statement->execute();
        $rows = $statement->fetchAll(PDO::FETCH_ASSOC) ?: [];

        return array_map(fn(array $row): array => $this->deserializeRow($table, $row), $rows);
    }

    public function firstBy(string $table, array $conditions = [], array $params = [], array $orderBy = ['id ASC']): ?array
    {
        $rows = $this->select($table, $conditions, $params, $orderBy, 1);
        return $rows[0] ?? null;
    }

    public function updateById(string $table, int $id, array $changes): ?array
    {
        if ($id <= 0) {
            return null;
        }

        $rows = $this->updateManyBy($table, ['id = :id'], ['id' => $id], $changes);
        return $rows[0] ?? null;
    }

    public function updateFirstBy(string $table, array $conditions, array $params, array $changes, array $orderBy = ['id ASC']): ?array
    {
        $row = $this->firstBy($table, $conditions, $params, $orderBy);
        if ($row === null) {
            return null;
        }

        return $this->updateById($table, (int) ($row['id'] ?? 0), $changes);
    }

    public function updateManyBy(string $table, array $conditions, array $params, array $changes): array
    {
        $this->ensureTable($table);
        $definition = self::TABLES[$table] ?? null;
        if ($definition === null) {
            throw new RuntimeException("Tabla no soportada: {$table}");
        }

        $payload = $this->serializeRow($table, $changes);
        unset($payload['id']);
        if ($payload === []) {
            return [];
        }

        $assignments = [];
        foreach ($payload as $column => $_value) {
            $assignments[] = $this->quoteIdentifier($column) . ' = :set_' . $column;
        }

        $sql = 'UPDATE ' . $this->quoteIdentifier($table) . ' SET ' . implode(', ', $assignments);
        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' RETURNING *';

        $statement = $this->pdo->prepare($sql);
        foreach ($payload as $column => $value) {
            $this->bindValue($statement, 'set_' . $column, $value, $definition['columns'][$column]);
        }
        foreach ($params as $name => $value) {
            $this->bindDynamicValue($statement, (string) $name, $value);
        }

        $statement->execute();
        $rows = $statement->fetchAll(PDO::FETCH_ASSOC) ?: [];
        return array_map(fn(array $row): array => $this->deserializeRow($table, $row), $rows);
    }

    public function deleteById(string $table, int $id): bool
    {
        if ($id <= 0) {
            return false;
        }

        return $this->deleteManyBy($table, ['id = :id'], ['id' => $id]) > 0;
    }

    public function deleteManyBy(string $table, array $conditions, array $params = []): int
    {
        $this->ensureTable($table);
        $sql = 'DELETE FROM ' . $this->quoteIdentifier($table);
        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $statement = $this->pdo->prepare($sql);
        foreach ($params as $name => $value) {
            $this->bindDynamicValue($statement, (string) $name, $value);
        }

        $statement->execute();
        return $statement->rowCount();
    }

    private function serializeRow(string $table, array $row): array
    {
        $payload = [];
        foreach (self::TABLES[$table]['columns'] as $column => $type) {
            if (!array_key_exists($column, $row)) {
                continue;
            }
            $payload[$column] = match ($type) {
                'int' => $row[$column] === null ? null : (int) $row[$column],
                'bool' => $row[$column] === null ? null : (bool) $row[$column],
                'json' => json_encode($row[$column] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                default => $row[$column] === null ? null : (string) $row[$column],
            };
        }

        return $payload;
    }

    private function deserializeRow(string $table, array $row): array
    {
        $decoded = [];
        foreach (self::TABLES[$table]['columns'] as $column => $type) {
            $value = $row[$column] ?? null;
            $decoded[$column] = match ($type) {
                'int' => $value === null ? null : (int) $value,
                'bool' => $value === null ? null : filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $value,
                'json' => is_array($value) ? $value : (json_decode((string) $value, true) ?: []),
                default => $value,
            };
        }

        return $decoded;
    }

    private function bindValue(\PDOStatement $statement, string $column, mixed $value, string $type): void
    {
        $param = ':' . $column;
        if ($value === null) {
            $statement->bindValue($param, null, PDO::PARAM_NULL);
            return;
        }

        $pdoType = match ($type) {
            'int' => PDO::PARAM_INT,
            'bool' => PDO::PARAM_BOOL,
            default => PDO::PARAM_STR,
        };

        $statement->bindValue($param, $value, $pdoType);
    }

    private function bindDynamicValue(\PDOStatement $statement, string $name, mixed $value): void
    {
        $param = str_starts_with($name, ':') ? $name : ':' . $name;
        if ($value === null) {
            $statement->bindValue($param, null, PDO::PARAM_NULL);
            return;
        }

        $pdoType = match (true) {
            is_int($value) => PDO::PARAM_INT,
            is_bool($value) => PDO::PARAM_BOOL,
            default => PDO::PARAM_STR,
        };

        $statement->bindValue($param, $value, $pdoType);
    }

    private function connect(): PDO
    {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            $this->config('DB_HOST', 'postgres'),
            $this->config('DB_PORT', '5432'),
            $this->config('DB_DATABASE', 'ledi')
        );

        try {
            return new PDO(
                $dsn,
                $this->config('DB_USERNAME', 'ledi'),
                $this->config('DB_PASSWORD', 'ledi_secret'),
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            throw new RuntimeException('No se pudo conectar a PostgreSQL: ' . $e->getMessage(), 0, $e);
        }
    }

    private function config(string $key, string $default): string
    {
        $value = getenv($key);
        return $value === false || $value === '' ? $default : $value;
    }

    private function resolveSchemaName(string $storagePath): string
    {
        $fromEnv = getenv('DB_SCHEMA');
        if (is_string($fromEnv) && trim($fromEnv) !== '') {
            return $this->sanitizeIdentifier($fromEnv);
        }

        $name = basename(str_replace('\\', '/', rtrim($storagePath, '/\\')));
        return $this->sanitizeIdentifier($name !== '' ? 'ledi_' . $name : 'ledi_app');
    }

    private function sanitizeIdentifier(string $value): string
    {
        $clean = strtolower(preg_replace('/[^a-zA-Z0-9_]+/', '_', $value) ?? 'ledi_app');
        $clean = trim($clean, '_');
        if ($clean === '' || ctype_digit($clean[0])) {
            $clean = 'ledi_' . $clean;
        }

        return substr($clean, 0, 63);
    }

    private function quoteIdentifier(string $identifier): string
    {
        return '"' . str_replace('"', '""', $identifier) . '"';
    }
}
