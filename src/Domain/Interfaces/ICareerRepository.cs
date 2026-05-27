using Domain.Entities;

namespace Domain.Interfaces;

public interface ICareerRepository
{
    Task<Career?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Career>> GetByDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default);
    void Add(Career career);
    void Update(Career career);
    void Remove(Career career);
}