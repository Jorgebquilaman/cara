# CARA - Control de Activos y Reservas de Artefactos

CARA es un sistema full-stack diseñado para la gestión integral de activos físicos, préstamos y reservas en el IUPA (Instituto Universitario Patagónico de las Artes).

## Descripción del Proyecto

El sistema centraliza la administración de equipamiento universitario, permitiendo:
- **Gestión de Activos:** Inventario, estado y categorización de recursos.
- **Reservas y Préstamos:** Flujo de trabajo para solicitar activos, aprobación administrativa y seguimiento de devoluciones.
- **Notificaciones en tiempo real:** Uso de SignalR para alertas inmediatas sobre cambios en el estado de préstamos.
- **Sanciones:** Gestión automática de usuarios inhabilitados.

## Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query.
- **Backend:** .NET 8 Web API, Entity Framework Core, CQRS pattern (MediatR), FluentValidation.
- **Database:** PostgreSQL.
- **Caching:** Redis.
- **Real-time:** SignalR.
- **Infraestructura:** Docker & Docker Compose.

## Instalación para Desarrolladores

### Prerrequisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+)](https://nodejs.org/)
- [Docker y Docker Compose](https://docs.docker.com/get-docker/)

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd CARA
   ```

2. **Iniciar la infraestructura (DB y Redis):**
   ```bash
   docker-compose up -d
   ```

3. **Configurar el Backend:**
   ```bash
   cd src
   dotnet restore
   dotnet run --project WebAPI/WebAPI.csproj
   ```
   *La API estará disponible en `http://localhost:5000`.*

4. **Configurar el Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *El frontend estará disponible en `http://localhost:5174` (o `5173`).*

---

## Instalación en Producción

Para entornos de producción, se recomienda el uso de contenedores Docker para garantizar la consistencia.

### Prerrequisitos
- Servidor con Docker y Docker Compose instalados.
- Nginx u otro servidor web como proxy inverso para manejar HTTPS.

### Pasos
1. **Configurar variables de entorno:** Crea un archivo `.env` o ajusta el `docker-compose.prod.yml` con las credenciales seguras (DB, secretos JWT).

2. **Desplegar con Docker:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

3. **Migraciones:** Asegúrate de ejecutar las migraciones de EF Core sobre la base de datos de producción antes del despliegue:
   ```bash
   dotnet ef database update --project src/Infrastructure --startup-project src/WebAPI
   ```

---

## Arquitectura

El backend sigue el patrón de **Clean Architecture**:
1. **Domain:** Entidades centrales y lógica de negocio.
2. **Application:** Casos de uso (CQRS) y DTOs.
3. **Infrastructure:** Implementación de repositorios, EF Core y servicios externos.
4. **WebAPI:** Controladores, Hubs de SignalR y configuración de seguridad (JWT).
