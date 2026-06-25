using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface IImportExportUseCase
{
    Task<TourExportResponseDto> ExportAsync(CancellationToken cancellationToken = default);

    Task<TourImportResultDto> ImportAsync(string fileName, byte[] content, CancellationToken cancellationToken = default);
}

