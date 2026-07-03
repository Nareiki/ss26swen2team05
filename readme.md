# Tour Planner

Tour Planner is a full-stack tour management app for planning, tracking,
and reviewing bike, hike, running, and vacation tours.

It combines an **ASP.NET Core 10 backend** with an **Angular 21 frontend**.

This is a **school project** created for the SWEN semester assignment.

## Main functionality

- User registration, login, and refresh-token auth
- Create, edit, and delete tours and tour logs
- Search tours and logs, including computed values
- OpenRouteService-backed routing with a fallback estimate
- Tour import/export as JSON
- Tour image storage on disk

## Clean Architecture

The backend is split into layers with clear dependency direction:

- **Domain** holds the business entities and rules.
- **Application** defines use cases and interfaces for things like persistence, routing, and file handling.
- **Infrastructure** implements those interfaces with EF Core, PostgreSQL, JWT, filesystem storage, and external APIs.
- **API** exposes controllers and request/response models.
- **TourPlanner** is the host that wires everything together.

In this project, the implementation follows that structure by keeping business logic
out of controllers, putting data access in repositories, and registering dependencies
through DI in the host startup. The frontend stays separate and calls the backend
through the HTTP API.

## Project layout

| Path | Purpose |
| --- | --- |
| `Backend/` | ASP.NET Core API, EF Core, PostgreSQL, auth, file storage, tests |
| `Frontend/` | Angular client with Leaflet and OpenRouteService integration |

## Requirements

- .NET 10 SDK
- Node.js 18+ and npm
- Docker Desktop if you want the easiest backend setup
- An OpenRouteService API key for live routing and geocoding

## Recommended setup

### 1. Start the backend with Docker

```bash
cd Backend
cp .env.example .env
```

Fill in `.env` with your own values. At minimum, set:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `JWT_SIGNING_KEY`
- `OPENROUTE_API_KEY` (optional, but recommended)

Then start the API and database:

```bash
docker compose up --build
```

The API is available at `http://localhost:10001` by default.

Development API docs:

- `http://localhost:10001/scalar/v1`
- `http://localhost:10001/openapi/v1.json`

### 2. Configure the frontend

```bash
cd ../Frontend
npm install
```

Create `src/environments/environment.ts` from the template and add both values:

```ts
export const environment = {
  apiUrl: 'http://localhost:10001',
  orsApiKey: 'YOUR_API_KEY_HERE'
};
```

`apiUrl` must point to the backend that is running locally or in Docker.

### 3. Run the frontend

```bash
npm start
```

Open `http://localhost:4200` in your browser.

## Local development without Docker

If you want to run the backend directly:

```bash
cd Backend
dotnet restore
dotnet run --project TourPlanner/TourPlanner.csproj
```

You need a PostgreSQL database running locally and backend configuration values set through appsettings or environment variables. The default local connection string expects:

- host: `localhost`
- database: `tourplanner`
- user: `postgres`
- password: `postgres`

The backend applies EF Core migrations automatically in development unless `DisableDatabaseMigrations=true` is set.

## Testing

Backend:

```bash
cd Backend
dotnet test TourPlanner.sln
```

Frontend:

```bash
cd Frontend
npm test
```

## Useful notes

- The backend serves interactive API docs only in non-production environments.
- Tour images are stored on disk; the database stores the path, not the file itself.
- If OpenRouteService is unavailable, the backend falls back to a deterministic route estimate.
