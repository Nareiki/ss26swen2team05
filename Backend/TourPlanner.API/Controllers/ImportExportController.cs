using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.API.Controllers;

[ApiController]
[Authorize]
[Route("api/import-export")]
public sealed class ImportExportController(IImportExportUseCase importExportUseCase) : ControllerBase
{
    [HttpGet("export")]
    public async Task<IActionResult> Export(CancellationToken cancellationToken)
    {
        var response = await importExportUseCase.ExportAsync(cancellationToken);
        return File(response.Content, response.ContentType, response.FileName);
    }

    [HttpPost("import")]
    [RequestSizeLimit(25_000_000)]
    public async Task<ActionResult<TourImportResultDto>> Import([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length <= 0)
        {
            return BadRequest("The uploaded file is empty.");
        }

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        return Ok(await importExportUseCase.ImportAsync(file.FileName, stream.ToArray(), cancellationToken));
    }
}

