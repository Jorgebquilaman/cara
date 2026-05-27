namespace Application.Services;

public interface IExportService
{
    Task<byte[]> ExportToCsvAsync<T>(IReadOnlyList<T> data, string fileName, CancellationToken cancellationToken = default);
    Task<byte[]> ExportToPdfAsync<T>(IReadOnlyList<T> data, string title, CancellationToken cancellationToken = default);
}
