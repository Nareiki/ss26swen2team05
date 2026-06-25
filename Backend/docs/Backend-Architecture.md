# TourPlanner Backend Architecture

## Goal

This backend follows strict Clean Architecture with dependency direction:

- `TourPlanner` (host/composition root)
- `TourPlanner.API` (presentation/controllers)
- `TourPlanner.Application` (use cases + interfaces/ports)
- `TourPlanner.Domain` (entities + business rules)
- `TourPlanner.Contracts` (request/response contracts)
- `TourPlanner.Infrastructure` (EF Core/PostgreSQL, auth, filesystem, external API)
- `TourPlanner.Tests` (unit tests)

Dependency rule:

- Outer layers depend inward.
- Domain depends on no other project.
- Application depends only on Domain + Contracts.
- Infrastructure depends on Application abstractions and Domain.
- API depends on Application abstractions + Contracts.
- Host wires everything.

## Folder Structure

### `TourPlanner.Application`

- `Abstractions/`
  - `Context/`, `Files/`, `Persistence/`, `Routing/`, `Security/`, `Time/`, `UseCases/`
- `Common/`
  - `ContractMapping.cs`
- `Services/`
  - `AuthUseCase.cs`
  - `TourUseCase.cs`
  - `TourLogUseCase.cs`
  - `SearchUseCase.cs`
  - `ImportExportUseCase.cs`
- `DependencyInjection.cs`

### `TourPlanner.Domain`

- `Common/` (`EntityBase`, `Guard`)
- `Entities/` (`User`, `UserSession`, `Tour`, `TourLog`)
- `Enums/` (`TransportType`, `TourDifficulty`)
- `Metrics/` (`TourMetrics`, `TourMetricsCalculator`)

### `TourPlanner.Contracts`

- `Common/`
- `Auth/`
- `TourLogs/`
- `Tours/`

### `TourPlanner.Infrastructure`

- `Options/` (`JwtOptions`, `StorageOptions`, `OpenRouteOptions`)
- `Persistence/` (`TourPlannerDbContext`, repositories)
- `Services/` (clock, user context, hashing, jwt, file storage, route API)
- `DependencyInjection.cs`

### `TourPlanner.API`

- `AssemblyReference.cs`
- `Controllers/`
  - `AuthController.cs`
  - `ToursController.cs`
  - `TourLogsController.cs`
  - `TourLogItemController.cs`
  - `SearchController.cs`
  - `ImportExportController.cs`
  - `HealthController.cs`

## Runtime Flow (Use Case Driven)

1. Controller receives request DTO from `Contracts`.
2. Controller calls use case interface from `Application.Abstractions`.
3. Use case executes domain rules and orchestrates repositories/services.
4. Persistence/external concerns are implemented in `Infrastructure`.
5. Use case returns DTO from `Contracts` to controller.

## Key Design Decisions

- **JWT auth**: access + refresh token workflow.
- **Password security**: PBKDF2 hashing.
- **Storage separation**: image files on filesystem, image path in DB.
- **Computed metrics**: popularity + child-friendliness from logs.
- **External route service**: OpenRouteService integration with deterministic fallback.
- **Search**: full-text-like matching over tour and log aggregate strings.

## SOLID Notes

- **S**: each class has one role (controller/use case/repository/service/entity).
- **O**: behavior extended via interfaces and DI, not runtime type switching in API layer.
- **L**: all implementations are substitutable for their interfaces.
- **I**: ports are small and use-case focused.
- **D**: use cases depend on abstractions, not infrastructure classes.

## Configuration

Externalized via `appsettings` and environment variables:

- `ConnectionStrings:DefaultConnection`
- `Jwt:*`
- `Storage:BasePath`
- `OpenRouteService:*`

No secrets are hardcoded in C# source.

## Logging

- log4net is configured via `TourPlanner/log4net.config`.
- Unhandled exceptions are converted to JSON error responses in host pipeline.

## Testing

- NUnit tests in `TourPlanner.Tests/Tests.cs`.
- Current suite validates auth flow, tour creation, recommendation ordering, metrics.

## Commands

```bash
cd /Users/christianredl/TechnikumWien/Semester4/SWEN/ss26swen2team05/Backend
dotnet build TourPlanner.sln -v minimal
dotnet test TourPlanner.sln -v minimal
```

