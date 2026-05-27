namespace Domain.Exceptions;

public class AssetNotAvailableException : DomainException
{
    public Guid AssetId { get; }

    public AssetNotAvailableException(Guid assetId)
        : base($"Asset {assetId} is not available for loan.")
    {
        AssetId = assetId;
    }
}
