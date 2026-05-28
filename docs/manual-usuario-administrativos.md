# Manual de Usuario — Administrativos (Admin / Staff)

## CARA — Centro de Asignación de Recursos Académicos

---

## 1. Acceso al Sistema

1. Abrí tu navegador e ingresá a la URL del sistema.
2. Iniciá sesión con tu correo institucional y contraseña.
3. Los usuarios **Admin** ven todas las opciones del menú; los **Staff** ven un subconjunto (ej: no ven Usuarios, Importar, Departamentos, etc.).

![Login](docs/Captura de pantalla 2026-05-28 a las 11.39.27.png)

---

## 2. Panel Principal (Dashboard)

Resumen ejecutivo con indicadores clave:

- **Total de Activos** registrados.
- **Préstamos Activos** actualmente en circulación.
- **Usuarios Totales** del sistema.
- **Pendientes**: suma de solicitudes de préstamo + reservas sin aprobar.
- **Encuestas Realizadas**: cantidad total de encuestas completadas.

---

## 3. Activos

Gestión del inventario de activos (equipos, herramientas, espacios).

### 3.1 Listado y Búsqueda

- Tabla con código, nombre, departamento, ubicación, estado y acciones.
- **Buscador** por código o nombre.
- **Filtro por estado**: Disponible, En Uso, Mantenimiento, Fuera de Servicio.

### 3.2 Crear / Editar / Eliminar Activo

- **Crear**: completá código, nombre, departamento, ubicación, descripción, imagen, días máximos de préstamo y categoría.
- **Editar**: modificá cualquier campo.
- **Eliminar**: solo disponible para **Admin**. Al eliminar, el activo se marca como *Decommissioned* (no se borra físicamente).

### 3.3 Importar desde Excel (Admin)

1. Hacé clic en **"Importar"** en el menú lateral.
2. Seleccioná un archivo `.xlsx` con las columnas: `Código`, `Nombre`, `Departamento`, `Ubicación`, `Descripción`.
3. Revisá la vista previa con los datos detectados.
4. Hacé clic en **"Importar"**. Los duplicados por código se saltan automáticamente.

### 3.4 Exportar

- **Excel**: descarga todos los activos filtrados como archivo `.xlsx`.
- **PDF**: descarga como documento PDF.

---

## 4. Préstamos

Gestión completa del ciclo de vida de los préstamos.

### 4.1 Listado y Filtros

- Tabla con activo, usuario, fechas, estado y acciones.
- **Buscador** por activo o usuario.
- **Filtro por estado**: Pendientes, Aprobados, Activos, Vencidos, Devueltos, Rechazados.
- Las columnas son **ordenables** haciendo clic en el encabezado.

### 4.2 Crear Préstamo (Admin/Staff)

1. Hacé clic en **"Nuevo Préstamo"**.
2. Seleccioná el **usuario** (podés buscarlo por nombre o email).
3. Seleccioná el **activo**.
4. Elegí **fecha y hora de inicio** y **fecha y hora de devolución**.
5. Agregá **observaciones** si es necesario.
6. Indicá el valor de **prenda** (garantía en $ARS, por defecto 0).
7. Hacé clic en **"Crear"**.

> Si el usuario tiene **sanciones activas**, se muestra una advertencia antes de crear el préstamo.

### 4.3 Gestionar Préstamos

| Acción | Estado Requerido | Descripción |
|--------|------------------|-------------|
| **Aprobar** | Pendiente | Confirma el préstamo. El usuario puede pasar a retirar el activo. |
| **Rechazar** | Pendiente | Se debe indicar un motivo. Se notifica al usuario. |
| **Confirmar Retiro** | Aprobado | Marca que el usuario ya retiró el activo físicamente. Cambia a Activo. |
| **Registrar Devolución** | Activo / Vencido | Marca la devolución. Opcionalmente se puede registrar un incidente con foto. |
| **Enviar Recordatorio** | Activo / Vencido | Envía una notificación al usuario recordando la devolución. |

---

## 5. Vencidos

Lista de todos los préstamos en estado **Vencido** (no devueltos antes de la fecha límite).

- Podés **enviar alerta de vencimiento** al usuario desde esta pantalla.
- Podés **registrar la devolución** cuando el usuario finalmente devuelva el activo.

---

## 6. Reservas

Gestión de reservas de activos.

### 6.1 Listado y Filtros

- Tabla con activo, usuario, fecha/hora, estado.
- Buscador y filtro por estado.

### 6.2 Gestionar Reservas

- **Confirmar**: la reserva pasa a estado Confirmada.
- **Cancelar**: se anula la reserva.
- **Completar**: convierte la reserva en un préstamo **Activo** (el usuario ya retiró el activo).

### 6.3 Exportar

- **Excel** y **PDF** con los datos de todas las reservas.

---

## 7. Calendario

Vista mensual de todas las reservas y préstamos del sistema.

- Cada evento muestra activo, usuario responsable y horario.
- Útil para detectar conflictos de disponibilidad.

---

## 8. Usuarios (Admin)

Gestión de cuentas de usuario del sistema.

### 8.1 Listado

- Tabla con nombre, email institucional, rol, carrera/departamento, estado y sanciones activas.
- Buscador por nombre o email.

### 8.2 Crear Usuario

1. Hacé clic en **"Nuevo Usuario"**.
2. Completá nombre, apellido, email institucional, rol (Admin/Staff/Docente/Estudiante), carrera/departamento.
3. Hacé clic en **"Crear"**. El usuario recibirá un email para establecer su contraseña.

### 8.3 Editar / Activar / Desactivar

- **Editar**: modificá datos del usuario.
- **Activar/Desactivar**: habilitar o deshabilitar el acceso al sistema.

---

## 9. Solicitudes de Alta (Admin)

Usuarios que se registraron por autogestión y esperan aprobación.

- **Aprobar**: activa la cuenta del usuario.
- **Rechazar**: deniega la solicitud (opcionalmente con motivo).

---

## 10. Departamentos (Admin)

Gestión de departamentos académicos y carreras.

- **Crear Departamento**: nombre y descripción.
- **Editar**: modificar datos del departamento.
- **Crear Carrera**: dentro de un departamento, con nombre y código.
- **Editar/Eliminar Carrera**.

---

## 11. Sanciones

Gestión de sanciones a usuarios.

### 11.1 Crear Sanción

1. Seleccioná el **usuario**.
2. Indicá el **motivo** y adjuntá un archivo si corresponde.
3. Establecé la **fecha de expiración**.
4. Hacé clic en **"Aplicar Sanción"**.

> Mientras la sanción esté activa, el usuario no podrá solicitar nuevos préstamos.

### 11.2 Resolver Sanción

Podés marcar una sanción como resuelta antes de su fecha de expiración.

### 11.3 Exportar

Descargar listado de sanciones activas en CSV.

---

## 12. Incidentes

Registro de todos los incidentes reportados durante devoluciones.

- **Resolver**: marcá el incidente como solucionado.
- Cada incidente muestra el activo, usuario, descripción y foto (si se adjuntó).
- Un activo con incidentes **no resueltos** no puede ser prestado.

---

## 13. Reportes

### 13.1 Estadísticas (Gráficos)

- Indicadores KPI en la parte superior.
- **Valoraciones de Encuestas**: promedio general, atención, tiempo de solicitud y calidad del activo, cada uno con estrellas visuales.
- **Activos más solicitados** (top 10).
- **Préstamos por carrera**.
- **Encuestas por activo**: cantidad y valoración promedio.

### 13.2 Exportar Reportes CSV

- Préstamos Activos
- Activos por Categoría
- Usuarios con Sanciones
- Historial de Auditoría
- Encuestas de Satisfacción

### 13.3 Historial de Usuario

1. Hacé clic en **"Historial de Usuario"** (solo Admin).
2. Seleccioná un usuario de la lista.
3. Se muestran todos sus **préstamos**, **incidentes** y **sanciones**.
4. Podés exportar el historial como CSV.

---

## 14. Notificaciones

Campana de notificaciones en el menú.

- Muestra un contador con las notificaciones sin leer.
- Las notificaciones se reciben en tiempo real vía SignalR.
- Podés marcar como leídas.

---

## 15. Config. Email (Admin)

Configuración del servidor SMTP para el envío de correos electrónicos:

- Host y puerto SMTP.
- Usuario y contraseña.
- Email remitente.
- Habilitar/deshabilitar SSL.

---

## 16. Menú Lateral

- **Colapsable**: hacé clic en el ícono de menú (☰) en la parte superior del sidebar para colapsarlo a solo íconos.
- **Modo oscuro**: toggle Sol/Luna abajo a la izquierda.
- **Perfil**: hacé clic en tu nombre para ir a tu perfil.
- **Cerrar sesión**: ícono de salida.

---

## 17. Solución de Problemas

| Problema | Solución |
|----------|----------|
| No veo una opción del menú | Verificá que tengas el rol adecuado (algunas funciones son solo Admin). |
| No puedo aprobar un préstamo | El préstamo debe estar en estado **Pendiente**. |
| No puedo eliminar un activo | Solo los usuarios **Admin** pueden eliminar activos. |
| Error 403 en Reportes | La sección "Historial de Usuario" es solo para **Admin**. |
| El activo no aparece disponible | Puede tener incidentes sin resolver o estar en uso. |
