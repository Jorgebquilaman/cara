using FluentValidation;

namespace Application.Features.Loans.Commands.CreateLoan;

public class CreateLoanValidator : AbstractValidator<CreateLoanCommand>
{
    public CreateLoanValidator()
    {
        RuleFor(v => v.AssetId).NotEmpty();
        RuleFor(v => v.UserId).NotEmpty();
        RuleFor(v => v.StartDate).NotEmpty();
        RuleFor(v => v.DueDate)
            .NotEmpty()
            .GreaterThan(v => v.StartDate).WithMessage("Due date must be after start date.");
    }
}
