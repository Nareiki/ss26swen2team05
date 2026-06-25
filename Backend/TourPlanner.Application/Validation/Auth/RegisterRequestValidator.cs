using FluentValidation;
using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Validation.Auth;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MinimumLength(3).MaximumLength(64);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
    }
}

