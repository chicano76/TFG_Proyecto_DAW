<?php

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/auth.php';

applyCors();

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$pdo = getConnection();

// --- Auth ---
if ($uri === '/api/auth/login' && $method === 'POST') {
    require __DIR__ . '/controllers/AuthController.php';
    handleLogin($pdo);
}

if ($uri === '/api/auth/logout' && $method === 'POST') {
    require __DIR__ . '/controllers/AuthController.php';
    handleLogout($pdo);
}

// --- Clientes ---
if ($uri === '/api/clientes' && $method === 'GET') {
    require __DIR__ . '/controllers/ClientController.php';
    listClients($pdo);
}
if ($uri === '/api/clientes' && $method === 'POST') {
    require __DIR__ . '/controllers/ClientController.php';
    createClient($pdo);
}
if (preg_match('#^/api/clientes/(\d+)$#', $uri, $m) && $method === 'PUT') {
    require __DIR__ . '/controllers/ClientController.php';
    updateClient($pdo, (int)$m[1]);
}
if (preg_match('#^/api/clientes/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    require __DIR__ . '/controllers/ClientController.php';
    deleteClient($pdo, (int)$m[1]);
}

// --- Trabajadores ---
if ($uri === '/api/trabajadores' && $method === 'GET') {
    require __DIR__ . '/controllers/WorkerController.php';
    listWorkers($pdo);
}
if ($uri === '/api/trabajadores' && $method === 'POST') {
    require __DIR__ . '/controllers/WorkerController.php';
    createWorker($pdo);
}
if (preg_match('#^/api/trabajadores/(\d+)$#', $uri, $m) && $method === 'PUT') {
    require __DIR__ . '/controllers/WorkerController.php';
    updateWorker($pdo, (int)$m[1]);
}
if (preg_match('#^/api/trabajadores/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    require __DIR__ . '/controllers/WorkerController.php';
    deleteWorker($pdo, (int)$m[1]);
}

// --- Rutas ---
if ($uri === '/api/rutas' && $method === 'GET') {
    require __DIR__ . '/controllers/RouteController.php';
    listRoutes($pdo);
}
if (preg_match('#^/api/rutas/(\d+)$#', $uri, $m) && $method === 'GET') {
    require __DIR__ . '/controllers/RouteController.php';
    getRoute($pdo, (int)$m[1]);
}
if ($uri === '/api/rutas' && $method === 'POST') {
    require __DIR__ . '/controllers/RouteController.php';
    createRoute($pdo);
}
if (preg_match('#^/api/rutas/(\d+)$#', $uri, $m) && $method === 'PUT') {
    require __DIR__ . '/controllers/RouteController.php';
    updateRoute($pdo, (int)$m[1]);
}
if (preg_match('#^/api/rutas/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    require __DIR__ . '/controllers/RouteController.php';
    deleteRoute($pdo, (int)$m[1]);
}

// --- Jornadas ---
if ($uri === '/api/jornadas' && $method === 'GET') {
    require __DIR__ . '/controllers/JourneyController.php';
    listJourneys($pdo);
}
if ($uri === '/api/jornadas' && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    createJourney($pdo);
}
if (preg_match('#^/api/jornadas/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    require __DIR__ . '/controllers/JourneyController.php';
    deleteJourney($pdo, (int)$m[1]);
}

if ($uri === '/api/mis-jornadas' && $method === 'GET') {
    require __DIR__ . '/controllers/JourneyController.php';
    getMyJourney($pdo);
}
if ($uri === '/api/mis-jornadas-finalizadas' && $method === 'GET') {
    require __DIR__ . '/controllers/JourneyController.php';
    getMyFinishedJourneys($pdo);
}

// Acciones de jornada
if (preg_match('#^/api/jornadas/(\d+)/iniciar$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    startJourney($pdo, (int)$m[1]);
}
if (preg_match('#^/api/jornadas/(\d+)/finalizar$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    endJourney($pdo, (int)$m[1]);
}
if (preg_match('#^/api/jornadas/(\d+)/pausas/iniciar$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    startPause($pdo, (int)$m[1]);
}
if (preg_match('#^/api/jornadas/(\d+)/pausas/finalizar$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    endPause($pdo, (int)$m[1]);
}
if (preg_match('#^/api/jornadas/(\d+)/visitas/(\d+)/llegada$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    registerArrival($pdo, (int)$m[1], (int)$m[2]);
}
if (preg_match('#^/api/jornadas/(\d+)/visitas/(\d+)/salida$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    registerDeparture($pdo, (int)$m[1], (int)$m[2]);
}
if (preg_match('#^/api/jornadas/(\d+)/incidencia$#', $uri, $m) && $method === 'POST') {
    require __DIR__ . '/controllers/JourneyController.php';
    reportIncident($pdo, (int)$m[1]);
}

// --- Informes ---
if ($uri === '/api/reports/work' && $method === 'GET') {
    require __DIR__ . '/controllers/ReportController.php';
    getWorkReport($pdo);
}
if ($uri === '/api/reports/my-work' && $method === 'GET') {
    require __DIR__ . '/controllers/ReportController.php';
    getMyWorkReport($pdo);
}
if ($uri === '/api/reports/stats' && $method === 'GET') {
    require __DIR__ . '/controllers/ReportController.php';
    getStats($pdo);
}

// Endpoint no encontrado
json_error('Endpoint no encontrado', 404);
