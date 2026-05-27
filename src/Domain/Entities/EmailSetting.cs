namespace Domain.Entities;

public class EmailSetting
{
    public Guid Id { get; private set; }
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "CARA - IUPA";
    public bool UseSsl { get; set; } = true;

    private EmailSetting() { }

    public EmailSetting(string host, int port, string username, string password, string fromEmail, string fromName, bool useSsl)
    {
        Id = Guid.NewGuid();
        Host = host;
        Port = port;
        Username = username;
        Password = password;
        FromEmail = fromEmail;
        FromName = fromName;
        UseSsl = useSsl;
    }
}
