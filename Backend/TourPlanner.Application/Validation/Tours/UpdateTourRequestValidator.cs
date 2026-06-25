using FluentValidation;
using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.Application.Validation.Tours;

public sealed class UpdateTourRequestValidator : AbstractValidator<UpdateTourRequestDto>
{
    public UpdateTourRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.From).NotEmpty().MaximumLength(256);
        RuleFor(x => x.To).NotEmpty().MaximumLength(256);
    }
}

