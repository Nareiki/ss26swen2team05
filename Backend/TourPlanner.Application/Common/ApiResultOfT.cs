namespace TourPlanner.Application.Common;

public sealed record ApiResult<T>(bool Success, T? Data = default, string? Message = null)
{
    public static ApiResult<T> Ok(T data, string? message = null) => new(true, data, message);

    public static ApiResult<T> Fail(string message) => new(false, default, message);
}

