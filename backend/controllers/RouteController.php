<?php

function listRoutes(PDO $pdo): void {
    requireAuth($pdo);

    $routes = $pdo->query('SELECT * FROM routes ORDER BY id')->fetchAll();

    foreach ($routes as &$route) {
        $route['id'] = (int)$route['id'];
        $route['paradas'] = getStopsForRoute($pdo, $route['id']);
    }

    json_success($routes);
}

function getRoute(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare('SELECT * FROM routes WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $route = $stmt->fetch();

    if (!$route) {
        json_error('Ruta no encontrada', 404);
    }

    $route['id'] = (int)$route['id'];
    $route['paradas'] = getStopsForRoute($pdo, $id);

    json_success($route);
}

function createRoute(PDO $pdo): void {
    requireAuth($pdo);

    $body   = getJsonBody();
    $nombre = trim($body['nombre'] ?? '');

    if (!$nombre) {
        json_error('El nombre es obligatorio', 400);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare('INSERT INTO routes (nombre) VALUES (:nombre)');
    $stmt->execute([':nombre' => $nombre]);
    $routeId = (int)$pdo->lastInsertId();

    if (!empty($body['paradas']) && is_array($body['paradas'])) {
        saveStops($pdo, $routeId, $body['paradas']);
    }

    $pdo->commit();

    json_success([
        'id'      => $routeId,
        'nombre'  => $nombre,
        'paradas' => getStopsForRoute($pdo, $routeId),
    ], 201);
}

function updateRoute(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare('SELECT * FROM routes WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $route = $stmt->fetch();

    if (!$route) {
        json_error('Ruta no encontrada', 404);
    }

    $body   = getJsonBody();
    $nombre = trim($body['nombre'] ?? $route['nombre']);

    $pdo->beginTransaction();

    $pdo->prepare('UPDATE routes SET nombre = :nombre WHERE id = :id')
        ->execute([':nombre' => $nombre, ':id' => $id]);

    if (isset($body['paradas']) && is_array($body['paradas'])) {
        $pdo->prepare('DELETE FROM route_stops WHERE route_id = :rid')
            ->execute([':rid' => $id]);
        saveStops($pdo, $id, $body['paradas']);
    }

    $pdo->commit();

    json_success([
        'id'      => $id,
        'nombre'  => $nombre,
        'paradas' => getStopsForRoute($pdo, $id),
    ]);
}

function deleteRoute(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare('DELETE FROM routes WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Ruta no encontrada', 404);
    }

    json_success(['message' => 'Ruta eliminada']);
}

// -- Helpers -------------------------------------------------------

function getStopsForRoute(PDO $pdo, int $routeId): array {
    $stmt = $pdo->prepare(
        'SELECT rs.client_id AS id_cliente, c.nombre, c.direccion, c.lat, c.lng, rs.orden
         FROM route_stops rs
         JOIN clients c ON c.id = rs.client_id
         WHERE rs.route_id = :rid
         ORDER BY rs.orden'
    );
    $stmt->execute([':rid' => $routeId]);
    $stops = $stmt->fetchAll();

    foreach ($stops as &$s) {
        $s['id_cliente'] = (int)$s['id_cliente'];
        $s['orden']      = (int)$s['orden'];
    }

    return $stops;
}

function saveStops(PDO $pdo, int $routeId, array $paradas): void {
    $stmt = $pdo->prepare(
        'INSERT INTO route_stops (route_id, client_id, orden) VALUES (:rid, :cid, :orden)'
    );

    foreach ($paradas as $p) {
        $clientId = $p['id_cliente'] ?? ($p['client_id'] ?? null);
        if (!$clientId) continue;

        $stmt->execute([
            ':rid'   => $routeId,
            ':cid'   => (int)$clientId,
            ':orden' => (int)($p['orden'] ?? 1),
        ]);
    }
}
