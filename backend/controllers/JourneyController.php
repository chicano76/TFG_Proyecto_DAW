<?php

// ── List all journeys (admin) ────────────────────────────────

function listJourneys(PDO $pdo): void {
    requireAuth($pdo);

    $rows = $pdo->query(
        'SELECT j.*, u.nombre AS trabajador, u.email AS email_trabajador, r.nombre AS ruta
         FROM journeys j
         JOIN users  u ON u.id = j.user_id
         JOIN routes r ON r.id = j.route_id
         ORDER BY j.fecha DESC, j.id DESC'
    )->fetchAll();

    foreach ($rows as &$row) {
        $row = formatJourney($pdo, $row);
    }

    json_success($rows);
}

// ── Create a journey (admin) ─────────────────────────────────

function createJourney(PDO $pdo): void {
    requireAuth($pdo);

    $body    = getJsonBody();
    $userId  = (int)($body['id_usuario'] ?? 0);
    $routeId = (int)($body['id_ruta'] ?? 0);
    $fecha   = $body['fecha'] ?? date('Y-m-d');
    $estado  = $body['estado'] ?? 'CREADA';

    if (!$userId || !$routeId) {
        json_error('id_usuario e id_ruta son obligatorios', 400);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO journeys (user_id, route_id, fecha, estado) VALUES (:uid, :rid, :fecha, :estado)'
    );
    $stmt->execute([':uid' => $userId, ':rid' => $routeId, ':fecha' => $fecha, ':estado' => $estado]);
    $jId = (int)$pdo->lastInsertId();

    // Create visit rows from route stops
    $stops = $pdo->prepare(
        'SELECT client_id, orden FROM route_stops WHERE route_id = :rid ORDER BY orden'
    );
    $stops->execute([':rid' => $routeId]);

    $ins = $pdo->prepare(
        'INSERT INTO visits (journey_id, client_id, orden) VALUES (:jid, :cid, :orden)'
    );
    foreach ($stops->fetchAll() as $s) {
        $ins->execute([':jid' => $jId, ':cid' => $s['client_id'], ':orden' => $s['orden']]);
    }

    $pdo->commit();

    $user  = $pdo->query("SELECT nombre, email FROM users WHERE id = $userId")->fetch();
    $route = $pdo->query("SELECT nombre FROM routes WHERE id = $routeId")->fetch();

    json_success([
        'id'                => $jId,
        'id_usuario'        => $userId,
        'id_ruta'           => $routeId,
        'fecha'             => $fecha,
        'estado'            => $estado,
        'trabajador'        => $user['nombre'] ?? 'Desconocido',
        'email_trabajador'  => $user['email'] ?? '',
        'ruta'              => $route['nombre'] ?? 'Ruta no encontrada',
        'visitas'           => getVisitsForJourney($pdo, $jId),
    ], 201);
}

// ── Delete a journey ─────────────────────────────────────────

function deleteJourney(PDO $pdo, int $id): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare('DELETE FROM journeys WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Jornada no encontrada', 404);
    }

    json_success(['message' => 'Jornada eliminada']);
}

// ── Worker: get active journey ───────────────────────────────

function getMyJourney(PDO $pdo): void {
    $user = requireAuth($pdo);

    $stmt = $pdo->prepare(
        "SELECT j.*, u.nombre AS trabajador, u.email AS email_trabajador, r.nombre AS ruta
         FROM journeys j
         JOIN users  u ON u.id = j.user_id
         JOIN routes r ON r.id = j.route_id
         WHERE j.user_id = :uid AND j.estado != 'FINALIZADA'
         ORDER BY j.fecha DESC
         LIMIT 1"
    );
    $stmt->execute([':uid' => $user['id']]);
    $row = $stmt->fetch();

    if (!$row) {
        json_success((object)[]);
        return;
    }

    json_success(formatJourney($pdo, $row));
}

// ── Worker: finished journeys ────────────────────────────────

function getMyFinishedJourneys(PDO $pdo): void {
    $user = requireAuth($pdo);

    $stmt = $pdo->prepare(
        "SELECT j.*, u.nombre AS trabajador, u.email AS email_trabajador, r.nombre AS ruta
         FROM journeys j
         JOIN users  u ON u.id = j.user_id
         JOIN routes r ON r.id = j.route_id
         WHERE j.user_id = :uid AND j.estado = 'FINALIZADA'
         ORDER BY j.fecha DESC"
    );
    $stmt->execute([':uid' => $user['id']]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row = formatJourney($pdo, $row);
    }

    json_success($rows);
}

// ── Start journey ────────────────────────────────────────────

function startJourney(PDO $pdo, int $id): void {
    requireAuth($pdo);
    $body = getJsonBody();

    $stmt = $pdo->prepare(
        "UPDATE journeys SET estado = 'EN_CURSO', inicio_real = NOW(),
                lat_inicio = :lat, lng_inicio = :lng
         WHERE id = :id"
    );
    $stmt->execute([
        ':lat' => $body['lat'] ?? null,
        ':lng' => $body['lng'] ?? null,
        ':id'  => $id,
    ]);

    json_success(['message' => 'Jornada iniciada']);
}

// ── End journey ──────────────────────────────────────────────

function endJourney(PDO $pdo, int $id): void {
    requireAuth($pdo);
    $body = getJsonBody();

    $stmt = $pdo->prepare(
        "UPDATE journeys SET estado = 'FINALIZADA', fin_real = NOW(),
                lat_fin = :lat, lng_fin = :lng
         WHERE id = :id"
    );
    $stmt->execute([
        ':lat' => $body['lat'] ?? null,
        ':lng' => $body['lng'] ?? null,
        ':id'  => $id,
    ]);

    json_success(['message' => 'Jornada finalizada']);
}

// ── Start pause ──────────────────────────────────────────────

function startPause(PDO $pdo, int $journeyId): void {
    requireAuth($pdo);

    $pdo->prepare('INSERT INTO pauses (journey_id, inicio) VALUES (:jid, NOW())')
        ->execute([':jid' => $journeyId]);

    $pdo->prepare('UPDATE journeys SET pausa_activa = 1 WHERE id = :id')
        ->execute([':id' => $journeyId]);

    json_success(['message' => 'Pausa iniciada']);
}

// ── End pause ────────────────────────────────────────────────

function endPause(PDO $pdo, int $journeyId): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare(
        'SELECT id, inicio FROM pauses WHERE journey_id = :jid AND fin IS NULL LIMIT 1'
    );
    $stmt->execute([':jid' => $journeyId]);
    $pause = $stmt->fetch();

    if ($pause) {
        $minutos = (int)round((time() - strtotime($pause['inicio'])) / 60);

        $pdo->prepare('UPDATE pauses SET fin = NOW(), minutos = :min WHERE id = :id')
            ->execute([':min' => $minutos, ':id' => $pause['id']]);

        $pdo->prepare(
            'UPDATE journeys SET pausa_activa = 0, total_min_descanso = total_min_descanso + :min WHERE id = :id'
        )->execute([':min' => $minutos, ':id' => $journeyId]);
    } else {
        $pdo->prepare('UPDATE journeys SET pausa_activa = 0 WHERE id = :id')
            ->execute([':id' => $journeyId]);
    }

    json_success(['message' => 'Pausa finalizada']);
}

// ── Register arrival at a visit ──────────────────────────────

function registerArrival(PDO $pdo, int $journeyId, int $clientId): void {
    requireAuth($pdo);
    $body = getJsonBody();

    $stmt = $pdo->prepare(
        'UPDATE visits SET llegada = NOW(), lat = :lat, lng = :lng
         WHERE journey_id = :jid AND client_id = :cid'
    );
    $stmt->execute([
        ':lat' => $body['lat'] ?? null,
        ':lng' => $body['lng'] ?? null,
        ':jid' => $journeyId,
        ':cid' => $clientId,
    ]);

    json_success(['message' => 'Llegada registrada']);
}

// ── Register departure from a visit ─────────────────────────

function registerDeparture(PDO $pdo, int $journeyId, int $clientId): void {
    requireAuth($pdo);

    $stmt = $pdo->prepare(
        'SELECT id, llegada FROM visits WHERE journey_id = :jid AND client_id = :cid'
    );
    $stmt->execute([':jid' => $journeyId, ':cid' => $clientId]);
    $visit = $stmt->fetch();

    $minutos = null;
    if ($visit && $visit['llegada']) {
        $minutos = (int)round((time() - strtotime($visit['llegada'])) / 60);
    }

    $pdo->prepare(
        'UPDATE visits SET salida = NOW(), minutos_visita = :min
         WHERE journey_id = :jid AND client_id = :cid'
    )->execute([':min' => $minutos, ':jid' => $journeyId, ':cid' => $clientId]);

    json_success(['message' => 'Salida registrada']);
}

// ── Report incident ──────────────────────────────────────────

function reportIncident(PDO $pdo, int $journeyId): void {
    requireAuth($pdo);

    $body = getJsonBody();
    $incidencia = $body['incidencia'] ?? '';

    $pdo->prepare('UPDATE journeys SET incidencia = :inc WHERE id = :id')
        ->execute([':inc' => $incidencia, ':id' => $journeyId]);

    json_success(['message' => 'Incidencia guardada']);
}

// ── Helpers ──────────────────────────────────────────────────

function formatJourney(PDO $pdo, array $row): array {
    $jId = (int)$row['id'];

    return [
        'id'                  => $jId,
        'id_usuario'          => (int)$row['user_id'],
        'id_ruta'             => (int)$row['route_id'],
        'fecha'               => $row['fecha'],
        'estado'              => $row['estado'],
        'trabajador'          => $row['trabajador'],
        'email_trabajador'    => $row['email_trabajador'],
        'ruta'                => $row['ruta'],
        'inicio_real'         => $row['inicio_real'],
        'fin_real'            => $row['fin_real'],
        'incidencia'          => $row['incidencia'],
        'pausa_activa'        => (bool)$row['pausa_activa'],
        'total_min_descanso'  => (int)$row['total_min_descanso'],
        'visitas'             => getVisitsForJourney($pdo, $jId),
        'pausas'              => getPausesForJourney($pdo, $jId),
    ];
}

function getVisitsForJourney(PDO $pdo, int $journeyId): array {
    $stmt = $pdo->prepare(
        'SELECT v.client_id AS id_cliente, c.nombre, c.direccion, c.lat, c.lng,
                v.orden, v.llegada, v.salida, v.minutos_visita
         FROM visits v
         JOIN clients c ON c.id = v.client_id
         WHERE v.journey_id = :jid
         ORDER BY v.orden'
    );
    $stmt->execute([':jid' => $journeyId]);
    $visits = $stmt->fetchAll();

    foreach ($visits as &$v) {
        $v['id_cliente']     = (int)$v['id_cliente'];
        $v['orden']          = (int)$v['orden'];
        $v['minutos_visita'] = $v['minutos_visita'] !== null ? (int)$v['minutos_visita'] : null;
    }

    return $visits;
}

function getPausesForJourney(PDO $pdo, int $journeyId): array {
    $stmt = $pdo->prepare(
        'SELECT inicio, fin, minutos FROM pauses WHERE journey_id = :jid ORDER BY inicio'
    );
    $stmt->execute([':jid' => $journeyId]);
    $pauses = $stmt->fetchAll();

    foreach ($pauses as &$p) {
        $p['minutos'] = $p['minutos'] !== null ? (int)$p['minutos'] : null;
    }

    return $pauses;
}
