using FluentValidation;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Contracts.Security;
using TourPlanner.Application.Dtos.Auth;
using TourPlanner.Domain;
using TourPlanner.Domain.Entities;

namespace TourPlanner.Application.Services;

public sealed class RegisterUseCase(
    IValidator<RegisterRequestDto> validator,
    IUserRepository users,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IUserSessionRepository sessions,
    IUnitOfWork unitOfWork) : IRegisterUseCase
{
    public async Task<AuthResponseDto> ExecuteAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        validator.ValidateAndThrow(request);

        var existing = await users.GetByUserNameAsync(request.UserName, cancellationToken);
        if (existing is not null)
        {
            throw new TourPlannerConflictException("The chosen user name is already registered.");
        }

        var user = User.Create(request.UserName, passwordHasher.Hash(request.Password));
        await users.AddAsync(user, cancellationToken);

        var tokens = await tokenService.GenerateTokenPairAsync(user, cancellationToken);
        await sessions.AddAsync(UserSession.Create(user.Id, tokens.RefreshToken, tokens.ExpiresAt), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(user.Id, user.UserName, tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt);
    }
}