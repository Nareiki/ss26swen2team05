using System;

namespace TourPlanner.Contracts.Time;

public interface IClock
{
    DateTimeOffset UtcNow { get; }
}



