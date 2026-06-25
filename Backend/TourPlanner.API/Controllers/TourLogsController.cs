using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.TourLogs;

namespace TourPlanner.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tours/{tourId:guid}/logs")]
public sealed class TourLogsController(ITourLogUseCase tourLogUseCase) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TourLogResponseDto>>> GetByTourId(Guid tourId, CancellationToken cancellationToken)
        => Ok(await tourLogUseCase.GetByTourIdAsync(tourId, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TourLogResponseDto>> Create(Guid tourId, [FromBody] CreateTourLogRequestDto request, CancellationToken cancellationToken)
    {
        var created = await tourLogUseCase.CreateAsync(tourId, request, cancellationToken);
        return CreatedAtAction(nameof(GetByTourId), new { tourId }, created);
    }
}

