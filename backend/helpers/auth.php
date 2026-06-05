<?php

function requireAuth(PDO $pdo): array {
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? '';

    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        json_error('No autorizado', 401);
    }

    $token = $matches[1];

    $stmt = $pdo->prepare(
        'SELECT s.user_id, u.id, u.nombre, u.email, u.rol
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.session_token = :token AND s.expires_at > NOW()'
    );
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch();

    if (!$user) {
        json_error('Sesión expirada o inválida', 401);
    }

    return $user;
}
