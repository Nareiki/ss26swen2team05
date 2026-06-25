using TourPlanner.Domain;

namespace TourPlanner.Contracts.Persistence;

public interface ITourRepository
{
    Task<Tour?> GetByIdAsync(Guid tourId, Guid userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Tour>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task AddAsync(Tour tour, CancellationToken cancellationToken = default);

    void Remove(Tour tour);
}


