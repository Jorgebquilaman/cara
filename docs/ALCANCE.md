# CARA — Alcance del Sistema

**Control de Activos y Reservas de Artefactos**
Instituto Universitario Patagónico de las Artes (IUPA)

---

## 1. Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| **Admin** | Acceso completo al sistema. Gestiona usuarios, departamentos, carreras, config. de email, sanciones, reportes y todas las funciones administrativas. |
| **Staff** | Personal operativo. Gestiona el inventario de activos, aprueba/rechaza préstamos y reservas, maneja incidentes y sanciones, genera contratos. |
| **Teacher** | Docentes. Pueden solicitar préstamos de activos y reservas con plazos extendidos. Responden encuestas de satisfacción. |
| **Student** | Estudiantes. Solicitan préstamos de activos y reservas. Responden encuestas de satisfacción. |

---

## 2. Funcionalidades por Módulo

### 2.1 Activos (Assets)
- CRUD completo de activos físicos (código, nombre, categoría, departamento, ubicación, imagen)
- Importación masiva desde CSV/JSON
- Visualización de disponibilidad por rango de fechas
- Generación de etiquetas ZPL para códigos de barras
- Estados: Disponible, En Uso, Mantenimiento, De Baja

### 2.2 Préstamos (Loans)
- Solicitud de préstamo por parte de estudiantes/docentes
- Aprobación/rechazo por Admin/Staff
- Retiro del activo con generación opcional de contrato (PDF)
- Devolución con registro de incidentes y valoración del usuario
- Control de prenda (depósito en garantía)
- Alertas de vencimiento y notificaciones automáticas
- Estados: Pendiente, Aprobado, Activo, Vencido, Devuelto, Rechazado

### 2.3 Reservas (Reservations)
- Solicitud de reserva de activos/espacios
- Aprobación, cancelación y finalización por Admin/Staff
- Estados: Pendiente, Confirmada, Cancelada, Completada

### 2.4 Contratos (Contracts)
- Creación de plantillas de contrato con contenido Markdown
- Generación automática de contrato al retirar un préstamo
- Selección de plantilla personalizada por tipo de préstamo
- Descarga en PDF e impresión
- Estados: Borrador, Activo, Vencido, Cancelado

### 2.5 Usuarios y Cuentas
- CRUD de usuarios (solo Admin)
- Solicitud de alta de cuenta con flujo de aprobación
- Recuperación de contraseña por email
- Roles: Admin, Staff, Teacher, Student

### 2.6 Departamentos y Carreras
- CRUD de departamentos académicos y carreras asociadas

### 2.7 Calendario
- Vista unificada de préstamos y reservas
- Filtros por tipo (préstamo/reserva) y estado
- Modo oscuro

### 2.8 Sanciones (Sanctions)
- Creación y resolución de sanciones a usuarios
- Carga de archivos adjuntos (evidencia)

### 2.9 Incidentes (Incidents)
- Reporte de daños o novedades durante la devolución
- Carga de fotos
- Resolución por Admin/Staff

### 2.10 Encuestas de Satisfacción (Surveys)
- Encuesta post-devolución con valoraciones (general, servicio, tiempo, calidad)
- Historial de encuestas completadas

### 2.11 Notificaciones
- Notificaciones en tiempo real (SignalR)
- Tipos: aprobación/rechazo de préstamo, recordatorio de vencimiento, sanción, estado de reserva, incidente, etc.
- Inbox de notificaciones por usuario

### 2.12 Reportes y Estadísticas
- Dashboard ejecutivo con KPIs
- Exportación CSV de préstamos, activos, sanciones, auditoría, encuestas
- Estadísticas de activos más usados, incidentes, préstamos por carrera/departamento
- Historial de uso por usuario

### 2.13 Configuración de Email
- Configuración SMTP para envío de notificaciones por correo

---

## 3. Permisos por Rol

| Módulo | Admin | Staff | Teacher | Student |
|--------|:-----:|:-----:|:-------:|:-------:|
| Activos — Ver | ✓ | ✓ | ✓ | ✓ |
| Activos — Crear/Editar | ✓ | ✓ | | |
| Activos — Importar | ✓ | ✓ | | |
| Activos — Eliminar | ✓ | | | |
| Préstamos — Gestionar todos | ✓ | ✓ | | |
| Préstamos — Solicitar | ✓ | ✓ | ✓ | ✓ |
| Préstamos — Aprobar/Rechazar/Retirar/Devolver | ✓ | ✓ | | |
| Reservas — Gestionar todas | ✓ | ✓ | | |
| Reservas — Solicitar/Cancelar propias | ✓ | ✓ | ✓ | ✓ |
| Reservas — Aprobar/Completar | ✓ | ✓ | | |
| Contratos | ✓ | ✓ | | |
| Usuarios — CRUD | ✓ | | | |
| Solicitudes de Alta — Aprobar/Rechazar | ✓ | | | |
| Departamentos y Carreras | ✓ | | | |
| Configuración de Email | ✓ | | | |
| Sanciones | ✓ | ✓ | | |
| Incidentes — Reportar | ✓ | ✓ | ✓ | ✓ |
| Incidentes — Resolver | ✓ | ✓ | | |
| Reportes y Estadísticas | ✓ | ✓ | | |
| Notificaciones — Enviar recordatorios | ✓ | ✓ | | |
| Notificaciones — Inbox propio | ✓ | ✓ | ✓ | ✓ |
| Encuestas de Satisfacción | | | ✓ | ✓ |
| Calendario — Todos los eventos | ✓ | ✓ | | |
| Calendario — Eventos propios | ✓ | ✓ | ✓ | ✓ |
| Dashboard operativo | ✓ | ✓ | | |
| Dashboard personal | ✓ | ✓ | ✓ | ✓ |
| Perfil y cambio de contraseña | ✓ | ✓ | ✓ | ✓ |

---

## 4. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, React Big Calendar, Recharts |
| **Backend** | .NET 8 Web API, Entity Framework Core, CQRS (MediatR), FluentValidation, AutoMapper, SignalR |
| **Base de datos** | PostgreSQL |
| **Caching** | Redis |
| **Infraestructura** | Docker & Docker Compose |
| **Tiempo real** | SignalR (WebSockets) |
