<?php

function listClients(PDO $pdo): void {
    requireAuth($pdo);

    $stmt = $pdo->query('SELECT * FROM clients ORDER BY id');
    json_success($stmt->fetchAll());
}

function createClient(PDO $pdo): void {
    requireAuth($pdo);

    $body = getJsonBody();
    $nombre    = trim($body['nombre'] ?? '');
    $direccion = trim($body['direccion'] ?? '');

    if (!$nombre) {
        json_error('El nombre es obligatorio', 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO clients (nombre, direccion, lat, lng) VALUES (:nombre, :dir, :lat, :lng)'
    );
    $stmt->execute([
        ':nombre' => $nombre,
        ':dir'    => $direccion ?: 'Madrid',
        ':lat'    => $body['lat'] ?? null,
        ':lng'    => $body['lng'] ?? null,
    ]);

    $id = (int)$pdo->lastInsertId();

    json_success([
        'id'        => $id,
        'nombre'    => $nombre,
        'direccion' => $direccion ?: 'Madrid',
        'lat'       => $body['lat'] ?? null,
        'lng'       => $body['lng'] ?? null,
    ], 201);
}

function updateClient(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $body = getJsonBody();

    $stmt = $pdo->prepare('SELECT * FROM clients WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $client = $stmt->fetch();

    if (!$client) {
        json_error('Cliente no encontrado', 404);
    }

    $nombre    = trim($body['nombre'] ?? $client['nombre']);
    $direccion = trim($body['direccion'] ?? $client['direccion']);
    $lat       = $body['lat'] ?? $client['lat'];
    $lng       = $body['lng'] ?? $client['lng'];

    $stmt = $pdo->prepare(
        'UPDATE clients SET nombre = :nombre, direccion = :dir, lat = :lat, lng = :lng WHERE id = :id'
    );
    $stmt->execute([':nombre' => $nombre, ':dir' => $direccion, ':lat' => $lat, ':lng' => $lng, ':id' => $id]);

    json_success([
        'id'        => $id,
        'nombre'    => $nombre,
        'direccion' => $direccion,
        'lat'       => $lat,
        'lng'       => $lng,
    ]);
}

function deleteClient(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare('DELETE FROM clients WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Cliente no encontrado', 404);
    }

    json_success(['message' => 'Cliente eliminado']);
}
