<?php

function listWorkers(PDO $pdo): void {
    requireAuth($pdo);

    $stmt = $pdo->query("SELECT id, nombre, email, rol FROM users WHERE rol = 'trabajador' ORDER BY id");
    json_success($stmt->fetchAll());
}

function createWorker(PDO $pdo): void {
    requireAuth($pdo);

    $body     = getJsonBody();
    $nombre   = trim($body['nombre'] ?? '');
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '123456';

    if (!$nombre || !$email) {
        json_error('Nombre y email son obligatorios', 400);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        "INSERT INTO users (nombre, email, password, rol) VALUES (:nombre, :email, :pass, 'trabajador')"
    );

    try {
        $stmt->execute([':nombre' => $nombre, ':email' => strtolower($email), ':pass' => $hash]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            json_error('Ya existe un usuario con ese email', 409);
        }
        throw $e;
    }

    json_success([
        'id'     => (int)$pdo->lastInsertId(),
        'nombre' => $nombre,
        'email'  => strtolower($email),
        'rol'    => 'trabajador',
    ], 201);
}

function updateWorker(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id AND rol = 'trabajador'");
    $stmt->execute([':id' => $id]);
    $worker = $stmt->fetch();

    if (!$worker) {
        json_error('Trabajador no encontrado', 404);
    }

    $body    = getJsonBody();
    $nombre  = trim($body['nombre'] ?? $worker['nombre']);
    $email   = trim($body['email'] ?? $worker['email']);

    $sql = 'UPDATE users SET nombre = :nombre, email = :email';
    $params = [':nombre' => $nombre, ':email' => strtolower($email), ':id' => $id];

    if (!empty($body['password']) && trim($body['password'])) {
        $sql .= ', password = :pass';
        $params[':pass'] = password_hash($body['password'], PASSWORD_BCRYPT);
    }

    $sql .= " WHERE id = :id AND rol = 'trabajador'";

    try {
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            json_error('Ya existe un usuario con ese email', 409);
        }
        throw $e;
    }

    json_success([
        'id'     => $id,
        'nombre' => $nombre,
        'email'  => strtolower($email),
        'rol'    => 'trabajador',
    ]);
}

function deleteWorker(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id AND rol = 'trabajador'");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Trabajador no encontrado', 404);
    }

    json_success(['message' => 'Trabajador eliminado']);
}
