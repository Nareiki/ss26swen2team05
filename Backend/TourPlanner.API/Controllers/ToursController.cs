using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tours")]
public sealed class ToursController(ITourUseCase tourUseCase) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TourSummaryResponseDto>>> GetAll(CancellationToken cancellationToken)
        => Ok(await tourUseCase.GetAllAsync(cancellationToken));

    [HttpGet("{tourId:guid}")]
    public async Task<ActionResult<TourDetailResponseDto>> GetById(Guid tourId, CancellationToken cancellationToken)
        => Ok(await tourUseCase.GetByIdAsync(tourId, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TourSummaryResponseDto>> Create([FromBody] CreateTourRequestDto requestDto, CancellationToken cancellationToken)
    {
        var created = await tourUseCase.CreateAsync(requestDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { tourId = created.Id }, created);
    }

    [HttpPut("{tourId:guid}")]
    public async Task<ActionResult<TourSummaryResponseDto>> Update(Guid tourId, [FromBody] UpdateTourRequestDto requestDto, CancellationToken cancellationToken)
        => Ok(await tourUseCase.UpdateAsync(tourId, requestDto, cancellationToken));

    [HttpDelete("{tourId:guid}")]
    public async Task<IActionResult> Delete(Guid tourId, CancellationToken cancellationToken)
    {
        await tourUseCase.DeleteAsync(tourId, cancellationToken);
        return NoContent();
    }

    [HttpGet("recommendations")]
    public async Task<ActionResult<IReadOnlyList<TourSummaryResponseDto>>> GetRecommendations([FromQuery] int take = 5, CancellationToken cancellationToken = default)
        => Ok(await tourUseCase.GetRecommendedAsync(take, cancellationToken));

    [HttpGet("{tourId:guid}/insights")]
    public async Task<ActionResult<TourInsightResponseDto>> GetInsights(Guid tourId, CancellationToken cancellationToken)
        => Ok(await tourUseCase.GetInsightsAsync(tourId, cancellationToken));

    [HttpPost("{tourId:guid}/image")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<UploadTourImageResponseDto>> UploadImage(Guid tourId, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length <= 0)
        {
            return BadRequest("The uploaded file is empty.");
        }

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        var response = await tourUseCase.UploadImageAsync(tourId, file.FileName, stream.ToArray(), cancellationToken);
        return Ok(response);
    }
}

