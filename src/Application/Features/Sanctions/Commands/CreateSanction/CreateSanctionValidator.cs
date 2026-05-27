using FluentValidation;

namespace Application.Features.Sanctions.Commands.CreateSanction;

public class CreateSanctionValidator : AbstractValidator<CreateSanctionCommand>
{
    public CreateSanctionValidator()
    {
        RuleFor(v => v.UserId)
            .NotEmpty();

        RuleFor(v => v.Reason)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(v => v.ExpiresAt)
            .NotEmpty()
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Expiration date must be in the future.");
    }
}
