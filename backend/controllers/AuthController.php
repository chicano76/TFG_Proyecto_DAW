<?php

function handleLogin(PDO $pdo): void {
    $body = getJsonBody();
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email || !$password) {
        json_error('Email y contraseña son obligatorios', 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
    $stmt->execute([':email' => strtolower($email)]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        json_error('Credenciales incorrectas', 401);
    }

    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $stmt = $pdo->prepare(
        'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (:token, :uid, :exp)'
    );
    $stmt->execute([':token' => $token, ':uid' => $user['id'], ':exp' => $expires]);

    json_success([
        'token' => $token,
        'user'  => [
            'id'     => (int)$user['id'],
            'nombre' => $user['nombre'],
            'email'  => $user['email'],
            'rol'    => $user['rol'],
        ]
    ]);
}

function handleLogout(PDO $pdo): void {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        $stmt = $pdo->prepare('DELETE FROM sessions WHERE session_token = :token');
        $stmt->execute([':token' => $matches[1]]);
    }

    json_success(['message' => 'Sesión cerrada']);
}
