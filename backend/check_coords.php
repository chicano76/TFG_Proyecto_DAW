<?php
require_once __DIR__ . '/config/database.php';
$pdo = getConnection();

echo "--- JOURNEYS for today ---\n";
$stmt = $pdo->query("SELECT id, fecha, lat_inicio, lng_inicio, lat_fin, lng_fin FROM journeys WHERE fecha = '2026-05-12'");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}

echo "\n--- ALL CLIENTS ---\n";
$stmt = $pdo->query("SELECT id, nombre, lat, lng FROM clients");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
