-- ============================================================
-- TimeRoute - Datos iniciales (seed)
-- Ejecutar DESPUES de db_schema.sql
-- ============================================================

USE timeroute_db;

-- ------------------------------------------------------------
-- Usuarios
-- Passwords: hasheados con password_hash() bcrypt
-- Hash generado con: php -r "echo password_hash('Worker2026', PASSWORD_BCRYPT);"
-- ------------------------------------------------------------
INSERT INTO users (id, nombre, email, password, rol) VALUES
(1, 'Admin Demo',     'admin@mock.com',   '$2y$10$ApIAiuqehxACeW9RpWdzH.SyzyB10Fkvc38XG7/vmZffW5ZUlgiCG', 'admin'),
(2, 'Juan Operador',  'worker@mock.com',  '$2y$10$ckFgssFDulbDGdcStoPRUeHZa9AvDv625ekQ0lsFYH/Rgra1BDFwq', 'trabajador'),
(3, 'Maria Ruta',     'worker2@mock.com', '$2y$10$ckFgssFDulbDGdcStoPRUeHZa9AvDv625ekQ0lsFYH/Rgra1BDFwq', 'trabajador');

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------
INSERT INTO clients (id, nombre, direccion) VALUES
(1, 'Cliente Puerta del Sol', 'Calle Mayor 1, 28013 Madrid'),
(2, 'Cliente Retiro',         'Paseo de García Lorca 2, 28009 Madrid'),
(3, 'Cliente Salamanca',      'Calle de Serrano 45, 28001 Madrid'),
(4, 'Cliente Moncloa',        'Calle de la Princesa 70, 28008 Madrid'),
(5, 'Cliente Chamberí',       'Calle de Santa Engracia 93, 28010 Madrid');

-- ------------------------------------------------------------
-- Rutas
-- ------------------------------------------------------------
INSERT INTO routes (id, nombre) VALUES
(1, 'Ruta 1');

-- ------------------------------------------------------------
-- Paradas de la Ruta 1 (5 clientes en orden)
-- ------------------------------------------------------------
INSERT INTO route_stops (route_id, client_id, orden) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5);

-- ------------------------------------------------------------
-- Jornada inicial: asignada a Juan Operador (id=2), Ruta 1, hoy
-- ------------------------------------------------------------
INSERT INTO `journeys` VALUES (1,2,1,'2026-05-11','FINALIZADA','2026-05-11 08:01:27','2026-05-11 17:05:46',NULL,1,57,40.4165860,-3.7046459,40.4364719,-3.6994168);

-- Pausas
INSERT INTO `pauses` VALUES (1,1,'2026-05-11 14:30:36','2026-05-11 15:27:14',57);

-- Visitas de la jornada (una por cada parada de la ruta)
INSERT INTO `visits` VALUES (1,1,1,1,'2026-05-11 08:01:27','2026-05-11 09:37:49',96,40.4165860,-3.7046459),(2,1,2,2,'2026-05-11 10:08:34','2026-05-11 11:13:02',65,40.3795562,-3.6216129),(3,1,3,3,'2026-05-11 11:42:09','2026-05-11 13:03:47',81,40.4289240,-3.6874553),(4,1,4,4,'2026-05-11 13:25:42','2026-05-11 14:26:13',61,40.4314277,-3.7168381),(5,1,5,5,'2026-05-11 15:40:27','2026-05-11 16:48:57',68,40.4364719,-3.6994168);



