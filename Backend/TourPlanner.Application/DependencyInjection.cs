using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Services;

namespace TourPlanner.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddTourPlannerApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IRegisterUseCase, RegisterUseCase>();
        services.AddScoped<ILoginUseCase, LoginUseCase>();
        services.AddScoped<IRefreshUseCase, RefreshUseCase>();
        services.AddScoped<ITourUseCase, TourUseCase>();
        services.AddScoped<ITourLogUseCase, TourLogUseCase>();
        services.AddScoped<ISearchUseCase, SearchUseCase>();
        services.AddScoped<IImportExportUseCase, ImportExportUseCase>();
        return services;
    }
    
    // public static IServiceCollection AddTourPlannerApplication(this IServiceCollection services)
    // {
    //     // 1. Automatically registers all your FluentValidation validators
    //     services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
    //
    //     // 2. AUTOMATIC USE CASE SCANNING:
    //     // Finds all closed, non-abstract classes ending with "UseCase" and 
    //     // registers them under their respective interfaces (e.g., IRegisterUseCase)
    //     var useCaseTypes = Assembly.GetExecutingAssembly()
    //         .GetTypes()
    //         .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("UseCase"));
    //
    //     foreach (var type in useCaseTypes)
    //     {
    //         var interfaceType = type.GetInterfaces()
    //             .FirstOrDefault(i => i.Name == $"I{type.Name}");
    //
    //         if (interfaceType != null)
    //         {
    //             services.AddScoped(interfaceType, type);
    //         }
    //     }
    //
    //     return services;
    // }
}



