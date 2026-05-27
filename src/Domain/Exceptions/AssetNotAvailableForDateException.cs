namespace Domain.Exceptions;

public class AssetNotAvailableForDateException : DomainException
{
    public AssetNotAvailableForDateException(Guid assetId, DateTime start, DateTime end)
        : base($"Asset {assetId} is not available from {start:d} to {end:d}.")
    {
    }
}
