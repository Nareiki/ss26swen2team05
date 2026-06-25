using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.TourLogs;

namespace TourPlanner.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tour-logs")]
public sealed class TourLogItemController(ITourLogUseCase tourLogUseCase) : ControllerBase
{
    [HttpGet("{tourLogId:guid}")]
    public async Task<ActionResult<TourLogResponseDto>> GetById(Guid tourLogId, CancellationToken cancellationToken)
        => Ok(await tourLogUseCase.GetByIdAsync(tourLogId, cancellationToken));

    [HttpPut("{tourLogId:guid}")]
    public async Task<ActionResult<TourLogResponseDto>> Update(Guid tourLogId, [FromBody] UpdateTourLogRequestDto request, CancellationToken cancellationToken)
        => Ok(await tourLogUseCase.UpdateAsync(tourLogId, request, cancellationToken));

    [HttpDelete("{tourLogId:guid}")]
    public async Task<IActionResult> Delete(Guid tourLogId, CancellationToken cancellationToken)
    {
        await tourLogUseCase.DeleteAsync(tourLogId, cancellationToken);
        return NoContent();
    }
}

