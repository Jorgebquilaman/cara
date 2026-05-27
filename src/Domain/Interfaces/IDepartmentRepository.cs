using Domain.Entities;

namespace Domain.Interfaces;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Department>> GetAllAsync(CancellationToken cancellationToken = default);
    void Add(Department department);
    void Update(Department department);
    void Remove(Department department);
}