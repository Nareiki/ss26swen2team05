using FluentValidation;
using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Validation.Auth;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(128);
    }
}

