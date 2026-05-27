using Domain.ValueObjects;

namespace Domain.Entities;

public class Department
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }

    private readonly List<Career> _careers = [];
    public IReadOnlyCollection<Career> Careers => _careers.AsReadOnly();

    private Department() { }

    public Department(string name)
    {
        Id = Guid.NewGuid();
        Name = name;
    }

    public void UpdateName(string name)
    {
        Name = name;
    }
}
