using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IRegisterUseCase registerUseCase,
    ILoginUseCase loginUseCase,
    IRefreshUseCase refreshUseCase
    ) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
        => Ok(await registerUseCase.ExecuteAsync(request, cancellationToken));

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
        => Ok(await loginUseCase.ExecuteAsync(request, cancellationToken));

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
        => Ok(await refreshUseCase.ExecuteAsync(request, cancellationToken));
}

