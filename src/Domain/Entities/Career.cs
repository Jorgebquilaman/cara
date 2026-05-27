using Domain.ValueObjects;

namespace Domain.Entities;

public class Career
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public Guid DepartmentId { get; private set; }

    public Department Department { get; private set; }

    private Career() { }

    public Career(string name, Guid departmentId)
    {
        Id = Guid.NewGuid();
        Name = name;
        DepartmentId = departmentId;
    }

    public void UpdateName(string name)
    {
        Name = name;
    }
}
