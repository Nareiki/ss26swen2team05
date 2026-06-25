using TourPlanner.Application.Dtos.Security;

namespace TourPlanner.Contracts.Security;

public interface ITokenService
{
    Task<TokenPair> GenerateTokenPairAsync(TourPlanner.Domain.User user, CancellationToken cancellationToken = default);
}