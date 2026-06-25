using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.API.Controllers;

[ApiController]
[Authorize]
[Route("api/search")]
public sealed class SearchController(ISearchUseCase searchUseCase) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<TourSearchResponseDto>> Search([FromQuery] string q, CancellationToken cancellationToken)
        => Ok(await searchUseCase.SearchAsync(q, cancellationToken));
}

