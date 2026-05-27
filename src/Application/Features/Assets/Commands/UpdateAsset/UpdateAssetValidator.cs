using FluentValidation;

namespace Application.Features.Assets.Commands.UpdateAsset;

public class UpdateAssetValidator : AbstractValidator<UpdateAssetCommand>
{
    public UpdateAssetValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.Category).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Department).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Location).NotEmpty().MaximumLength(200);
        RuleFor(v => v.MaxLoanDays).InclusiveBetween(1, 365);
    }
}
