<?php

function getWorkReport(PDO $pdo): void {
    requireAuth($pdo);

    $from   = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
    $to     = $_GET['to'] ?? date('Y-m-d');
    $userId = (int)($_GET['userId'] ?? 0);

    $where = "j.estado = 'FINALIZADA' AND j.fecha BETWEEN :from AND :to";
    $params = [':from' => $from, ':to' => $to];

    if ($userId) {
        $where .= ' AND j.user_id = :uid';
        $params[':uid'] = $userId;
    }

    json_success(buildReport($pdo, $where, $params));
}

function getMyWorkReport(PDO $pdo): void {
    $user = requireAuth($pdo);

    $from = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
    $to   = $_GET['to'] ?? date('Y-m-d');

    $where  = "j.estado = 'FINALIZADA' AND j.user_id = :uid AND j.fecha BETWEEN :from AND :to";
    $params = [':uid' => $user['id'], ':from' => $from, ':to' => $to];

    json_success(buildReport($pdo, $where, $params));
}

function getStats(PDO $pdo): void {
    requireAuth($pdo);

    $activeRoutes = (int)$pdo->query('SELECT COUNT(*) FROM routes')->fetchColumn();

    $row = $pdo->query(
        "SELECT COUNT(DISTINCT fecha) AS days FROM journeys WHERE estado = 'FINALIZADA'"
    )->fetch();

    json_success([
        'active_routes'     => $activeRoutes,
        'total_working_days' => (int)($row['days'] ?? 0),
        'total_km'          => 0,
    ]);
}

// ── Report builder ───────────────────────────────────────────

function buildReport(PDO $pdo, string $where, array $params): array {
    $stmt = $pdo->prepare(
        "SELECT j.id, j.fecha, j.incidencia, j.total_min_descanso, 
                j.lat_inicio, j.lng_inicio, j.lat_fin, j.lng_fin,
                r.nombre AS ruta
         FROM journeys j
         JOIN routes r ON r.id = j.route_id
         WHERE $where
         ORDER BY j.fecha"
    );
    $stmt->execute($params);
    $journeys = $stmt->fetchAll();

    $totalVisitas    = 0;
    $totalVisitasMin = 0;
    $totalDescansoMin = 0;
    $totalKm         = 0;
    $days = [];

    foreach ($journeys as $j) {
        $jId = (int)$j['id'];

        $visits = $pdo->prepare(
            'SELECT v.*, c.nombre AS nombre_cliente, c.lat AS client_lat, c.lng AS client_lng
             FROM visits v JOIN clients c ON c.id = v.client_id
             WHERE v.journey_id = :jid ORDER BY v.orden'
        );
        $visits->execute([':jid' => $jId]);
        $visitRows = $visits->fetchAll();

        $pauses = $pdo->prepare('SELECT * FROM pauses WHERE journey_id = :jid ORDER BY inicio');
        $pauses->execute([':jid' => $jId]);
        $pauseRows = $pauses->fetchAll();

        $minVisitasDia  = 0;
        $minDescanso    = (int)$j['total_min_descanso'];
        $visitasDia     = [];
        $kmDia          = 0;

        // --- Cálculo de Distancia ---
        $points = [];
        // Punto de inicio
        if ($j['lat_inicio'] && $j['lng_inicio']) {
            $points[] = ['lat' => $j['lat_inicio'], 'lng' => $j['lng_inicio']];
        }

        foreach ($visitRows as $v) {
            $totalVisitas++;
            $min = (int)($v['minutos_visita'] ?? 0);
            $totalVisitasMin += $min;
            $minVisitasDia += $min;

            $vLat = $v['lat'] ?? $v['client_lat'];
            $vLng = $v['lng'] ?? $v['client_lng'];

            if ($vLat && $vLng) {
                $points[] = ['lat' => $vLat, 'lng' => $vLng];
            }

            $visitasDia[] = [
                'nombre_cliente' => $v['nombre_cliente'],
                'llegada'        => $v['llegada'],
                'salida'         => $v['salida'],
                'minutos_visita' => $min,
            ];
        }

        // Punto final
        if ($j['lat_fin'] && $j['lng_fin']) {
            $points[] = ['lat' => $j['lat_fin'], 'lng' => $j['lng_fin']];
        }

        // Sumar distancias entre puntos consecutivos
        for ($i = 0; $i < count($points) - 1; $i++) {
            $kmDia += haversineDistance(
                $points[$i]['lat'], $points[$i]['lng'],
                $points[$i+1]['lat'], $points[$i+1]['lng']
            );
        }

        $totalKm += $kmDia;
        $totalDescansoMin += $minDescanso;

        $descansosDia = [];
        foreach ($pauseRows as $p) {
            $descansosDia[] = [
                'inicio'  => $p['inicio'],
                'fin'     => $p['fin'],
                'minutos' => (int)($p['minutos'] ?? 0),
            ];
        }

        $days[] = [
            'fecha'           => $j['fecha'],
            'ruta'            => $j['ruta'],
            'incidencia'      => $j['incidencia'],
            'km_dia'          => $kmDia,
            'min_visitas_dia' => $minVisitasDia,
            'min_descanso_dia' => $minDescanso,
            'isPartial'       => false,
            'visitas'         => $visitasDia,
            'tramos'          => [],
            'descansos'       => $descansosDia,
        ];
    }

    return [
        'summary' => [
            'km_total'          => $totalKm,
            'num_visitas'       => $totalVisitas,
            'total_visitas_min' => $totalVisitasMin,
            'total_descanso_min' => $totalDescansoMin,
            'isPartial'         => false,
        ],
        'days' => $days,
    ];
}

function haversineDistance($lat1, $lon1, $lat2, $lon2) {
    if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) return 0;
    $lat1 = (float)$lat1; $lon1 = (float)$lon1;
    $lat2 = (float)$lat2; $lon2 = (float)$lon2;

    $earthRadius = 6371; // km
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    return $earthRadius * $c;
}
