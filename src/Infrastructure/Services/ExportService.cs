using System.Reflection;
using System.Text;
using Application.Services;

namespace Infrastructure.Services;

public class ExportService : IExportService
{
    public Task<byte[]> ExportToCsvAsync<T>(IReadOnlyList<T> data, string fileName, CancellationToken cancellationToken = default)
    {
        var sb = new StringBuilder();
        var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        sb.AppendLine(string.Join(",", props.Select(p => EscapeCsv(p.Name))));

        foreach (var item in data)
        {
            var values = props.Select(p =>
            {
                var val = p.GetValue(item);
                return val is null ? "" : EscapeCsv(val.ToString()!);
            });
            sb.AppendLine(string.Join(",", values));
        }

        return Task.FromResult(Encoding.UTF8.GetBytes(sb.ToString()));
    }

    public Task<byte[]> ExportToPdfAsync<T>(IReadOnlyList<T> data, string title, CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("PDF export not yet supported");
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
