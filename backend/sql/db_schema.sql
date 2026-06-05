-- ============================================================
-- TimeRoute - Esquema de Base de Datos
-- MySQL 8.4
-- ============================================================

CREATE DATABASE IF NOT EXISTS timeroute_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE timeroute_db;

-- ------------------------------------------------------------
-- Usuarios (admin y trabajadores)
-- ------------------------------------------------------------
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(150)  NOT NULL,
    email      VARCHAR(255)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    rol        ENUM('admin', 'trabajador') NOT NULL DEFAULT 'trabajador',
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Sesiones (tokens de autenticacion)
-- ------------------------------------------------------------
CREATE TABLE sessions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(128)  NOT NULL UNIQUE,
    user_id       INT           NOT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    DATETIME      NOT NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------
CREATE TABLE clients (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(200) NOT NULL,
    direccion VARCHAR(400) NOT NULL,
    lat       DECIMAL(10,7) DEFAULT NULL,
    lng       DECIMAL(10,7) DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Rutas
-- ------------------------------------------------------------
CREATE TABLE routes (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Paradas de ruta (relacion ruta <-> cliente con orden)
-- ------------------------------------------------------------
CREATE TABLE route_stops (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    route_id  INT NOT NULL,
    client_id INT NOT NULL,
    orden     INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_rs_route  FOREIGN KEY (route_id)  REFERENCES routes(id)  ON DELETE CASCADE,
    CONSTRAINT fk_rs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY uq_route_order (route_id, orden)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Jornadas
-- ------------------------------------------------------------
CREATE TABLE journeys (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT  NOT NULL,
    route_id           INT  NOT NULL,
    fecha              DATE NOT NULL,
    estado             ENUM('CREADA', 'EN_CURSO', 'FINALIZADA') NOT NULL DEFAULT 'CREADA',
    inicio_real        DATETIME      DEFAULT NULL,
    fin_real           DATETIME      DEFAULT NULL,
    incidencia         TEXT          DEFAULT NULL,
    pausa_activa       TINYINT(1)    NOT NULL DEFAULT 0,
    total_min_descanso INT           NOT NULL DEFAULT 0,
    lat_inicio         DECIMAL(10,7) DEFAULT NULL,
    lng_inicio         DECIMAL(10,7) DEFAULT NULL,
    lat_fin            DECIMAL(10,7) DEFAULT NULL,
    lng_fin            DECIMAL(10,7) DEFAULT NULL,
    CONSTRAINT fk_j_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_j_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Visitas (registro de llegada/salida en cada parada)
-- ------------------------------------------------------------
CREATE TABLE visits (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    journey_id     INT NOT NULL,
    client_id      INT NOT NULL,
    orden          INT NOT NULL DEFAULT 1,
    llegada        DATETIME      DEFAULT NULL,
    salida         DATETIME      DEFAULT NULL,
    minutos_visita INT           DEFAULT NULL,
    lat            DECIMAL(10,7) DEFAULT NULL,
    lng            DECIMAL(10,7) DEFAULT NULL,
    CONSTRAINT fk_v_journey FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
    CONSTRAINT fk_v_client  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Pausas (descansos dentro de una jornada)
-- ------------------------------------------------------------
CREATE TABLE pauses (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    journey_id INT      NOT NULL,
    inicio     DATETIME NOT NULL,
    fin        DATETIME DEFAULT NULL,
    minutos    INT      DEFAULT NULL,
    CONSTRAINT fk_p_journey FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
) ENGINE=InnoDB;
