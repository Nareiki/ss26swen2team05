namespace TourPlanner.Contracts.Common;

public sealed record SearchResponse<TTourSummary, TTourLog>(IReadOnlyList<TTourSummary> Tours, IReadOnlyList<TTourLog> TourLogs);

