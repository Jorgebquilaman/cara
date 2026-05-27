namespace Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public string Status { get; set; }
    public string Department { get; set; }
    public string Location { get; set; }
    public string? Description { get; set; }
    public int MaxLoanDays { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAssetDto
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public string Department { get; set; }
    public string Location { get; set; }
    public string? Description { get; set; }
    public int MaxLoanDays { get; set; } = 7;
}

public class DateRangeDto
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string Type { get; set; }
}

public class AssetAvailabilityDto
{
    public Guid AssetId { get; set; }
    public List<DateRangeDto> BookedRanges { get; set; } = [];
}

public class UpdateAssetDto
{
    public string Name { get; set; }
    public string Category { get; set; }
    public string Department { get; set; }
    public string Location { get; set; }
    public string? Description { get; set; }
    public int MaxLoanDays { get; set; }
}
