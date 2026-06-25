# Swagger/API Documentation Setup

## Overview

The TourPlanner API uses ASP.NET Core's built-in OpenAPI support combined with a custom Swagger UI endpoint.

## Accessing Swagger UI

### Local Development (dotnet run)

When running locally with `dotnet run`, access Swagger UI at:

```
http://localhost:5001/swagger
```

Or if running on a different port, substitute the port number.

**Note**: When running with `dotnet run`, you'll need to set up the environment:
- Database connection (or disable migrations with `DisableDatabaseMigrations=true`)
- JWT signing key from `.env` file

### Docker (Recommended)

When running with Docker Compose:

```bash
docker compose up
```

Access Swagger UI at:

```
http://localhost:10001/swagger
```

This is the easiest way since Docker automatically loads the `.env` file.

## What you'll see

The `/swagger` endpoint serves a fully-functional Swagger UI page (loaded from jsDelivr CDN) that connects to the OpenAPI specification at `/openapi/v1.json`.

The UI allows you to:
- ✅ Browse all API endpoints organized by controller
- ✅ View detailed request/response schemas
- ✅ Try out endpoints directly from your browser
- ✅ Add JWT Bearer tokens for authentication to test protected endpoints
- ✅ See live responses with status codes
- ✅ Download the OpenAPI spec

## OpenAPI Specification

The raw OpenAPI 3.0 specification is also available at:

```
GET /openapi/v1.json
```

This is useful for:
- Code generation tools
- API documentation generators
- Automated testing frameworks
- IDE integrations

## Authentication in Swagger UI

To test protected endpoints:

1. **Register a user** using the `/api/auth/register` endpoint
2. **Login** using the `/api/auth/login` endpoint to get a JWT token
3. **Copy the token** from the login response
4. Click **"Authorize"** button in the top-right of Swagger UI
5. Paste: `Bearer YOUR_TOKEN_HERE`
6. Now all protected endpoints will include your token

## Endpoints

### Public (No Auth Required)
- `GET /health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Protected (Requires JWT Token)
- `GET /api/tours` - List tours
- `POST /api/tours` - Create tour
- `GET /api/tours/{id}` - Get tour
- `PUT /api/tours/{id}` - Update tour
- `DELETE /api/tours/{id}` - Delete tour
- `GET /api/tourlogs` - List tour logs
- `POST /api/tourlogs` - Create tour log
- `GET /api/search` - Search tours
- `POST /api/importexport/import` - Import tours
- `GET /api/importexport/export` - Export tours

## Technical Details

- **Framework**: ASP.NET Core 10
- **OpenAPI**: Microsoft.AspNetCore.OpenApi
- **Swagger UI**: Hosted via CDN (unpkg.com)
- **Environment**: Available in Development and Staging, disabled in Production
- **Compatibility**: Works with all .NET 10 builds

## Troubleshooting

**Swagger UI not loading?**
- Ensure you're not in Production environment
- Check browser console for CDN/network errors
- Verify `/openapi/v1.json` is accessible

**Endpoints not showing up?**
- Make sure endpoints have the `[ApiController]` attribute
- Check routing attributes like `[Route("api/...")]`
- Refresh the page to reload OpenAPI spec

**Can't authorize?**
- Verify JWT token is valid and not expired
- Check token format is exactly: `Bearer TOKEN_HERE`
- Ensure endpoint has `[Authorize]` attribute

