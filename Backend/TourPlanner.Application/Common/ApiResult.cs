namespace TourPlanner.Application.Common;

public sealed record ApiResult(bool Success, string? Message = null)
{
    public static ApiResult Ok(string? message = null) => new(true, message);

    public static ApiResult Fail(string message) => new(false, message);
}

