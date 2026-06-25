using TourPlanner.Domain.Entities;

namespace TourPlanner.Contracts.Persistence;

public interface IUserSessionRepository
{
    Task AddAsync(UserSession session, CancellationToken cancellationToken = default);

    Task<UserSession?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

    void Remove(UserSession session);
}


