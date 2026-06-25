# TourPlanner Backend

This backend is structured using a strict Clean Architecture approach:

- `TourPlanner` – ASP.NET Core host / composition root
- `TourPlanner.API` – presentation layer with controllers
- `TourPlanner.Application` – use cases and application ports
- `TourPlanner.Contracts` – shared request/response models
- `TourPlanner.Domain` – entities, value rules, and business calculations
- `TourPlanner.Infrastructure` – EF Core, PostgreSQL, JWT, filesystem storage, and external API integrations
- `TourPlanner.Tests` – NUnit-based unit tests

## Key backend features

- JWT-based authentication with user registration/login/refresh
- Tours and tour logs with CRUD operations
- OpenRouteService-backed route planning with a local fallback
- Tour image storage on the filesystem
- Search across tours and tour logs, including computed values
- Import/export of tours as JSON
- Popularity and child-friendliness scoring
- log4net logging

## Configuration

Keep secrets and environment-specific values outside the source code.

Required configuration keys:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:SigningKey`
- `Storage:BasePath`
- `OpenRouteService:ApiKey`

The included `compose.yaml` wires these values via environment variables.

## Run locally

```bash
cd /Users/christianredl/TechnikumWien/Semester4/SWEN/ss26swen2team05/Backend
dotnet restore
dotnet test
cd TourPlanner
dotnet run
```

## Notes

- The OpenRouteService client uses the real REST API when an API key is supplied and falls back to a deterministic route estimate otherwise.
- The existing database SQL file is kept as reference material; EF Core is the primary persistence mechanism.

## Documentation

- Architecture and layer details: `docs/Backend-Architecture.md`
- Requirement crosscheck: `docs/Checklist-Crosscheck.md`


