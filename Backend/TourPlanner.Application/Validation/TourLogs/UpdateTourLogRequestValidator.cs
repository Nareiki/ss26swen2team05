using FluentValidation;
using TourPlanner.Application.Dtos.TourLogs;

namespace TourPlanner.Application.Validation.TourLogs;

public sealed class UpdateTourLogRequestValidator : AbstractValidator<UpdateTourLogRequestDto>
{
    public UpdateTourLogRequestValidator()
    {
        RuleFor(x => x.Comment).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.TotalDistanceKm).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalTimeMinutes).GreaterThanOrEqualTo(0);
    }
}

