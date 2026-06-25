namespace TourPlanner.Application.Dtos.Security;

public sealed record TokenPair(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);


