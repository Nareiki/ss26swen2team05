using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Contracts.Persistence;
using TourPlanner.Contracts.Security;
using TourPlanner.Contracts.Files;
using TourPlanner.Contracts.Routing;
using TourPlanner.Contracts.Time;
using TourPlanner.Infrastructure.Options;
using TourPlanner.Infrastructure.Persistence;
using TourPlanner.Infrastructure.Services;

namespace TourPlanner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddTourPlannerInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["CONNECTION_STRING"]
            ?? throw new InvalidOperationException("The default database connection string is not configured.");

        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<StorageOptions>(configuration.GetSection("Storage"));
        services.Configure<OpenRouteOptions>(configuration.GetSection("OpenRouteService"));

        services.AddHttpContextAccessor();
        services.AddDbContext<TourPlannerDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<TourPlanner.Contracts.Persistence.IUnitOfWork>(sp => sp.GetRequiredService<TourPlannerDbContext>());
        services.AddScoped<TourPlanner.Contracts.Persistence.IUserRepository, UserRepository>();
        services.AddScoped<TourPlanner.Contracts.Persistence.IUserSessionRepository, UserSessionRepository>();
        services.AddScoped<TourPlanner.Contracts.Persistence.ITourRepository, TourRepository>();
        services.AddScoped<TourPlanner.Contracts.Persistence.ITourLogRepository, TourLogRepository>();
        services.AddSingleton<TourPlanner.Contracts.Time.IClock, SystemClock>();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();
        services.AddScoped<TourPlanner.Contracts.Security.IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddScoped<TourPlanner.Contracts.Security.ITokenService, JwtTokenService>();
        services.AddScoped<TourPlanner.Contracts.Files.IFileStorage, FileStorage>();
        services.AddHttpClient<TourPlanner.Contracts.Routing.IOpenRouteService, OpenRouteServiceClient>((sp, client) =>
        {
            var openRouteOptions = sp.GetRequiredService<IOptions<OpenRouteOptions>>().Value;
            if (!string.IsNullOrWhiteSpace(openRouteOptions.BaseUrl))
            {
                client.BaseAddress = new Uri(openRouteOptions.BaseUrl);
            }
        });

        return services;
    }
}

