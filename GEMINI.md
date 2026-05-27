# CARA - Control de Activos y Reservas de Artefactos

CARA is a full-stack system designed for the management of physical assets, loans, and reservations at IUPA (Instituto Universitario Patagónico de las Artes).

## Project Overview

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS.
- **Backend:** .NET 8 Web API following **Clean Architecture**.
- **Database:** PostgreSQL with Entity Framework Core.
- **Caching:** Redis.
- **Real-time:** SignalR for notifications and loan status updates.
- **Infrastructure:** Docker and Docker Compose for development and deployment.

---

## Backend Architecture (Clean Architecture)

The backend is organized into four distinct layers:

1.  **Domain:** Core business logic, entities, value objects, enums, and domain-specific exceptions.
2.  **Application:** Use cases (CQRS pattern with MediatR), DTOs, interfaces, and validators (FluentValidation).
3.  **Infrastructure:** External concerns like database persistence (EF Core), repository implementations, and external services (Auth, Notifications).
4.  **WebAPI:** Entry point, controllers, middleware, hubs (SignalR), and configuration.

### Key Backend Patterns
- **CQRS:** Commands and Queries are separated using MediatR. Each feature resides in `Application/Features/{FeatureName}/{Commands|Queries}`.
- **Repository Pattern:** Abstractions in `Domain/Interfaces` and implementations in `Infrastructure/Persistence/Repositories`.
- **Validation:** Automatic validation via `FluentValidation` middleware.
- **Mapping:** `AutoMapper` is used for converting Entities to DTOs.
- **Auditing:** Entity changes are tracked via `AuditableEntityInterceptor`.

---

## Frontend Architecture

The frontend follows a **feature-based** organization:

- **src/features:** Contains feature-specific components, pages, and logic (e.g., `assets`, `loans`, `users`).
- **src/components:** Shared UI components (Radix-like components in `ui/`, layouts in `layout/`).
- **src/hooks:** Custom React hooks for shared logic (e.g., `useAuth`, `useAssets`).
- **src/services:** API communication layers using Axios and SignalR.
- **src/store:** State management using **Zustand**.
- **src/types:** Shared TypeScript interfaces and types.

### Key Frontend Technologies
- **TanStack Query (React Query):** Data fetching and synchronization.
- **Zustand:** Lightweight state management for auth and sync status.
- **React Hook Form + Zod:** Form management and validation.
- **Lucide React:** Icon library.

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- Docker and Docker Compose

### Building and Running

#### 1. Infrastructure (Database & Redis)
```bash
docker-compose up -d
```

#### 2. Backend
```bash
cd src
dotnet restore
dotnet run --project WebAPI/WebAPI.csproj
```
The API will be available at `http://localhost:5000` (or `https://localhost:5001`). Swagger UI is available in Development mode at `/swagger`.

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## Development Conventions

### Backend
- **Entities:** Must be kept clean of persistence logic. Use private constructors for EF and public constructors/methods for business logic.
- **MediatR:** One command/query per file. Handlers and validators should be in the same folder as their respective request.
- **Exceptions:** Use Domain Exceptions for business rule violations.
- **Migrations:** Managed via EF Core. Run from the project root:
  `dotnet ef database update --project src/Infrastructure --startup-project src/WebAPI`

### Frontend
- **Components:** Use functional components with hooks.
- **Styling:** Use Tailwind CSS utility classes. Prefer `cn()` utility for conditional classes.
- **Types:** Always define interfaces for API responses and component props.
- **API Calls:** Wrap API calls in custom hooks using `useQuery` or `useMutation`.

---

## Real-time Notifications
The system uses SignalR hubs:
- `LoanHub`: `/hubs/loans` - Real-time updates on loan status.
- `NotificationHub`: `/hubs/notifications` - System-wide user notifications.

---

## Environment Configuration
Sensitive configuration (JWT secrets, DB credentials) should be managed via environment variables or `appsettings.json`. For development, defaults are provided in `docker-compose.yml` and `appsettings.Development.json`.
