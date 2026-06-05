# TimeRoute

TimeRoute es una solución integral para la gestión de rutas y jornadas de trabajadores, diseñada para optimizar la planificación y el seguimiento en tiempo real.

## Características Principales

- **Gestión de Clientes y Rutas**: Administración centralizada de localizaciones y recorridos.
- **Control de Jornadas**: Registro de inicio, fin, pausas e incidencias.
- **Panel de Administración**: Visualización de informes y estadísticas de trabajo.
- **Interfaz Adaptativa**: Diseñada para su uso tanto en dispositivos móviles como en escritorio.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Angular CLI](https://angular.dev/tools/cli)
- Servidor PHP (para el backend)
- Servidor MySQL (para la base de datos)

## Instalación y Ejecución

1. Clonar el repositorio.
2. Instalar las dependencias de la aplicación Angular:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   ng serve
   ```
4. Acceder a la aplicación en `http://localhost:4200/`.

## Iniciar servidor (PHP)

Para iniciar un servidor PHP local, ejecutar:

```bash
cd backend
php -S localhost:8000 index.php
```

## Inicializar base de datos (MySQL)

Para crear e inicializar la base de datos, importar:

```bash
cd backend

# 1. Crear la estructura de la base de datos
mysql -u root < sql/db_schema.sql

# 2. Insertar los datos iniciales
mysql -u root < sql/db_initializer.sql

```

## Usuarios por defecto (usuario/contraseña):

- admin: admin@mock.com/Timeroute26admin
- worker: worker@mock.com/Worker2026
- worker2: worker2@mock.com/Worker2026


## Tecnologías Utilizadas

- **Frontend**: Angular 19, SCSS, RxJS.
- **Backend**: PHP, MySQL.
