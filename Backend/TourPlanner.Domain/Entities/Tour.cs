using TourPlanner.Domain.Enums;

namespace TourPlanner.Domain.Entities;

public sealed class Tour : EntityBase
{
    public Guid UserId { get; private set; }

    public User User { get; private set; } = null!;

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public string From { get; private set; } = string.Empty;

    public string To { get; private set; } = string.Empty;

    public TransportType TransportType { get; private set; }

    public double DistanceKm { get; private set; }

    public double EstimatedMinutes { get; private set; }

    public string RouteInformation { get; private set; } = string.Empty;

    public string? ImagePath { get; private set; }

    public int Popularity { get; private set; }

    public double ChildFriendliness { get; private set; }

    public ICollection<TourLog> TourLogs { get; private set; } = new List<TourLog>();

    private Tour()
    {
    }

    public static Tour Create(
        Guid userId,
        string name,
        string description,
        string from,
        string to,
        TransportType transportType,
        double distanceKm,
        double estimatedMinutes,
        string routeInformation)
    {
        Guard.NotEmpty(userId, nameof(userId));
        Guard.NotNullOrWhiteSpace(name, nameof(name));
        Guard.NotNullOrWhiteSpace(description, nameof(description));
        Guard.NotNullOrWhiteSpace(from, nameof(from));
        Guard.NotNullOrWhiteSpace(to, nameof(to));
        Guard.NotNullOrWhiteSpace(routeInformation, nameof(routeInformation));

        return new Tour
        {
            UserId = userId,
            Name = name.Trim(),
            Description = description.Trim(),
            From = from.Trim(),
            To = to.Trim(),
            TransportType = transportType,
            DistanceKm = distanceKm,
            EstimatedMinutes = estimatedMinutes,
            RouteInformation = routeInformation.Trim(),
            Popularity = 0,
            ChildFriendliness = 100d
        };
    }

    public void Update(
        string name,
        string description,
        string from,
        string to,
        TransportType transportType,
        double distanceKm,
        double estimatedMinutes,
        string routeInformation)
    {
        Guard.NotNullOrWhiteSpace(name, nameof(name));
        Guard.NotNullOrWhiteSpace(description, nameof(description));
        Guard.NotNullOrWhiteSpace(from, nameof(from));
        Guard.NotNullOrWhiteSpace(to, nameof(to));
        Guard.NotNullOrWhiteSpace(routeInformation, nameof(routeInformation));

        Name = name.Trim();
        Description = description.Trim();
        From = from.Trim();
        To = to.Trim();
        TransportType = transportType;
        DistanceKm = distanceKm;
        EstimatedMinutes = estimatedMinutes;
        RouteInformation = routeInformation.Trim();
        Touch();
    }

    public void UpdateMetrics(int popularity, double childFriendliness)
    {
        Popularity = Math.Max(0, popularity);
        ChildFriendliness = Math.Clamp(childFriendliness, 0, 100);
        Touch();
    }

    public void UpdateImagePath(string? imagePath)
    {
        ImagePath = string.IsNullOrWhiteSpace(imagePath) ? null : imagePath.Trim();
        Touch();
    }

    public string BuildSearchDocument() => string.Join(
        ' ',
        Name,
        Description,
        From,
        To,
        TransportType,
        DistanceKm.ToString("0.##"),
        EstimatedMinutes.ToString("0.##"),
        Popularity.ToString(),
        ChildFriendliness.ToString("0.##"),
        ImagePath ?? string.Empty,
        RouteInformation);
}

