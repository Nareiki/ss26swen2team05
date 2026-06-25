using FluentValidation;
using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Validation.Auth;

public sealed class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequestDto>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty().MaximumLength(256);
    }
}

