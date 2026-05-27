using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly ApplicationDbContext _context;
    public DepartmentRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<Department>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Departments.OrderBy(d => d.Name).ToListAsync(cancellationToken);

    public async Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Departments.FindAsync(new object[] { id }, cancellationToken);

    public void Add(Department department)
    {
        _context.Departments.Add(department);
    }

    public void Update(Department department)
    {
        _context.Departments.Update(department);
    }

    public void Remove(Department department)
    {
        _context.Departments.Remove(department);
    }
}

public class CareerRepository : ICareerRepository
{
    private readonly ApplicationDbContext _context;
    public CareerRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<Career>> GetByDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
        => await _context.Careers.Where(c => c.DepartmentId == departmentId).OrderBy(c => c.Name).ToListAsync(cancellationToken);

    public async Task<Career?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Careers.FindAsync(new object[] { id }, cancellationToken);

    public void Add(Career career)
    {
        _context.Careers.Add(career);
    }

    public void Update(Career career)
    {
        _context.Careers.Update(career);
    }

    public void Remove(Career career)
    {
        _context.Careers.Remove(career);
    }
}
