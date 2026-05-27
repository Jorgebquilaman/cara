using FluentValidation;

namespace Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetValidator()
    {
        RuleFor(v => v.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(50).WithMessage("Code must not exceed 50 characters.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(v => v.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters.");

        RuleFor(v => v.Department)
            .NotEmpty().WithMessage("Department is required.")
            .MaximumLength(100).WithMessage("Department must not exceed 100 characters.");

        RuleFor(v => v.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.");

        RuleFor(v => v.MaxLoanDays)
            .InclusiveBetween(1, 365).WithMessage("Max loan days must be between 1 and 365.");
    }
}
