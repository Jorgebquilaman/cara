using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/lookups")]
[AllowAnonymous]
public class LookupsController : ControllerBase
{
    private readonly IDepartmentRepository _departmentRepo;
    private readonly ICareerRepository _careerRepo;

    public LookupsController(IDepartmentRepository departmentRepo, ICareerRepository careerRepo)
    {
        _departmentRepo = departmentRepo;
        _careerRepo = careerRepo;
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var depts = await _departmentRepo.GetAllAsync();
        return Ok(depts.Select(d => new { d.Id, d.Name }));
    }

    [HttpGet("careers")]
    public async Task<IActionResult> GetCareers([FromQuery] Guid? departmentId)
    {
        if (departmentId == null)
            return Ok(Array.Empty<object>());

        var careers = await _careerRepo.GetByDepartmentAsync(departmentId.Value);
        return Ok(careers.Select(c => new { c.Id, c.Name, c.DepartmentId }));
    }
}
