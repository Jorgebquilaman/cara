# Manual de Usuario — Estudiantes y Docentes

## CARA — Centro de Asignación de Recursos Académicos

---

## 1. Acceso al Sistema

1. Abrí tu navegador e ingresá a la URL del sistema (ej: `http://localhost:5173` o la URL provista por la institución).
2. Iniciá sesión con tu correo institucional (`@iupa.edu.ar`) y contraseña.
3. Si olvidaste tu contraseña, contactá al administrador del sistema.

![Login](screenshots/login.png)

---

## 2. Panel Principal (Dashboard)

Al ingresar se muestra un resumen con:

- **Préstamos activos** que tenés en este momento.
- **Reservas pendientes** próximas a vencer.
- **Notificaciones sin leer**.
- Accesos directos a las secciones más usadas.

Desde acá podés navegar a cualquier sección usando el menú lateral izquierdo.

---

## 3. Mis Préstamos

Sección para gestionar todos tus préstamos de activos.

### 3.1 Solicitar un Préstamo

1. Hacé clic en **"Nuevo Préstamo"**.
2. Seleccioná el **activo** que querés (podés ver el código, nombre y disponibilidad).
3. Elegí la **fecha y hora de inicio** y **fecha y hora de devolución**.
4. Si querés, agregá **observaciones** (ej: "lo necesito para una clase el martes").
5. Opcionalmente, indicá un valor de **prenda** (garantía en pesos argentinos, por defecto $0).
6. Hacé clic en **"Solicitar"**.

> El préstamo quedará en estado **Pendiente** hasta que un administrador lo apruebe.

### 3.2 Ver tus Préstamos

En la tabla podés ver:

- Código y nombre del activo
- Fechas de inicio y vencimiento
- Estado del préstamo (Pendiente, Aprobado, Activo, Devuelto, Rechazado, Vencido)

### 3.3 Devolver un Activo

Cuando el activo esté en estado **Activo**, podés devolverlo haciendo clic en el botón de devolución. Si tuviste algún inconveniente, podés describir un **incidente** (opcional) y adjuntar una foto.

### 3.4 Encuesta de Satisfacción

Después de devolver un activo, el sistema te pedirá que completes una **encuesta de satisfacción** con valoraciones del 1 al 5 en:

- Atención recibida
- Tiempo de solicitud
- Calidad del activo
- Valoración general

---

## 4. Mis Encuestas

Historial de todas las encuestas que completaste, con las valoraciones y comentarios que dejaste.

---

## 5. Reservas

Podés **reservar un activo** para una fecha y hora específica sin necesidad de retirarlo inmediatamente.

### 5.1 Crear una Reserva

1. Hacé clic en **"Nueva Reserva"**.
2. Seleccioná el **activo**.
3. Elegí **fecha**, **hora de inicio** y **hora de fin**.
4. Hacé clic en **"Reservar"**.

### 5.2 Ver tus Reservas

La tabla muestra todas tus reservas con su estado (Pendiente, Confirmada, Cancelada, Completada).

- Una reserva **Confirmada** se puede completar para generar un préstamo activo.
- Una reserva **Pendiente** puede ser cancelada.

---

## 6. Calendario

Vista general de todas las reservas y préstamos en un calendario mensual.

- Cada evento muestra el activo, usuario y horario.
- Podés navegar entre meses usando las flechas.

---

## 7. Notificaciones

Campana de notificaciones en el menú. Recibirás alertas por:

- **Préstamo vencido**: si no devolviste un activo a tiempo.
- **Reserva próxima**: recordatorio de que tenés una reserva pronto.
- **Préstamo aprobado/rechazado**: cuando un administrador procesa tu solicitud.

Podés marcar las notificaciones como leídas.

---

## 8. Perfil

Haciendo clic en tu nombre (abajo del menú lateral) accedés a tu perfil donde podés ver tus datos personales.

---

## 9. Consejos Útiles

| Concepto | Descripción |
|----------|-------------|
| **Prenda** | Garantía en pesos que se registra al solicitar un préstamo. Por defecto es $0. |
| **Incidente** | Cualquier problema con el activo al momento de devolverlo (roto, incompleto, etc.). |
| **Vencimiento** | Si no devolvés el activo antes de la fecha de vencimiento, el préstamo pasa a estado **Vencido** y podés recibir una sanción. |
| **Sanción** | Si acumulás préstamos vencidos, podés quedar inhabilitado para solicitar nuevos préstamos. |

---

## 10. Solución de Problemas

| Problema | Solución |
|----------|----------|
| No puedo iniciar sesión | Verificá que usás tu correo institucional. Si el problema persiste, contactá al administrador. |
| No veo el botón "Nuevo Préstamo" | Solo podés solicitar si no tenés sanciones activas y no superaste el límite de préstamos concurrentes. |
| No encuentro un activo | Usá el buscador por código o nombre. Si no aparece, puede estar fuera de circulación. |
| Error al reservar | Verificá que el activo esté disponible en el horario seleccionado. |
