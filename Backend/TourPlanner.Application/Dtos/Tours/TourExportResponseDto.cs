namespace TourPlanner.Application.Dtos.Tours;

public sealed record TourExportResponseDto(string FileName, string ContentType, byte[] Content);

