using TourPlanner.Contracts.Time;

namespace TourPlanner.Infrastructure.Services;

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}

