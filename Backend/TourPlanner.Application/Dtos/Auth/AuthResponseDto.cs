using System;

namespace TourPlanner.Application.Dtos.Auth;

public sealed record AuthResponseDto(Guid UserId, string UserName, string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);


