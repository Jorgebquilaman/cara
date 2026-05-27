using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize(Roles = "Admin")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentRepository _departmentRepo;
    private readonly ICareerRepository _careerRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentsController(IDepartmentRepository departmentRepo, ICareerRepository careerRepo, IUnitOfWork unitOfWork)
    {
        _departmentRepo = departmentRepo;
        _careerRepo = careerRepo;
        _unitOfWork = unitOfWork;
    }

    // GET: api/departments
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Department>>> GetDepartments()
    {
        var departments = await _departmentRepo.GetAllAsync();
        return Ok(departments);
    }

    // GET: api/departments/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(Guid id)
    {
        var department = await _departmentRepo.GetByIdAsync(id);
        if (department == null)
            return NotFound();

        return Ok(department);
    }

    // POST: api/departments
    [HttpPost]
    public async Task<ActionResult<Department>> CreateDepartment(DepartmentDto dto)
    {
        var department = new Department(dto.Name);
        _departmentRepo.Add(department);
        await SaveChangesAsync();
        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
    }

    // PUT: api/departments/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, DepartmentDto dto)
    {
        var department = await _departmentRepo.GetByIdAsync(id);
        if (department == null)
            return NotFound();

        department.UpdateName(dto.Name);
        _departmentRepo.Update(department);
        await SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/departments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(Guid id)
    {
        var department = await _departmentRepo.GetByIdAsync(id);
        if (department == null)
            return NotFound();

        _departmentRepo.Remove(department);
        await SaveChangesAsync();
        return NoContent();
    }

    // GET: api/departments/{departmentId}/careers
    [HttpGet("{departmentId}/careers")]
    public async Task<ActionResult<IReadOnlyList<Career>>> GetCareers(Guid departmentId)
    {
        var careers = await _careerRepo.GetByDepartmentAsync(departmentId);
        return Ok(careers);
    }

    // POST: api/departments/{departmentId}/careers
    [HttpPost("{departmentId}/careers")]
    public async Task<ActionResult<Career>> CreateCareer(Guid departmentId, CareerDto dto)
    {
        var career = new Career(dto.Name, departmentId);
        _careerRepo.Add(career);
        await SaveChangesAsync();
        return CreatedAtAction(nameof(GetCareers), new { departmentId, id = career.Id }, career);
    }

    // PUT: api/departments/{departmentId}/careers/{careerId}
    [HttpPut("{departmentId}/careers/{careerId}")]
    public async Task<IActionResult> UpdateCareer(Guid departmentId, Guid careerId, CareerDto dto)
    {
        var career = await _careerRepo.GetByIdAsync(careerId);
        if (career == null || career.DepartmentId != departmentId)
            return NotFound();

        career.UpdateName(dto.Name);
        _careerRepo.Update(career);
        await SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/departments/{departmentId}/careers/{careerId}
    [HttpDelete("{departmentId}/careers/{careerId}")]
    public async Task<IActionResult> DeleteCareer(Guid departmentId, Guid careerId)
    {
        var career = await _careerRepo.GetByIdAsync(careerId);
        if (career == null || career.DepartmentId != departmentId)
            return NotFound();

        _careerRepo.Remove(career);
        await SaveChangesAsync();
        return NoContent();
    }

    private async Task SaveChangesAsync()
    {
        await _unitOfWork.SaveChangesAsync();
    }
}

public class DepartmentDto
{
    public string Name { get; set; } = string.Empty;
}

public class CareerDto
{
    public string Name { get; set; } = string.Empty;
}