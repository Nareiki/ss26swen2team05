namespace TourPlanner.Application.Contracts.Security;

public sealed record TokenPair(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);


