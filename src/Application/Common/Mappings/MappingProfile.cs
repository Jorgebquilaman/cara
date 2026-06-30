using Application.DTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Asset, AssetDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<Loan, LoanDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.StartDate, o => o.MapFrom(s => s.Period.Start))
            .ForMember(d => d.DueDate, o => o.MapFrom(s => s.Period.End))
            .ForMember(d => d.AssetCode, o => o.MapFrom(s => s.Asset.Code))
            .ForMember(d => d.AssetName, o => o.MapFrom(s => s.Asset.Name))
            .ForMember(d => d.UserName, o => o.MapFrom(s => $"{s.User.FirstName} {s.User.LastName}"));

        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()))
            .ForMember(d => d.FullName, o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.InstitutionalEmail, o => o.MapFrom(s => s.InstitutionalEmail.Value))
            .ForMember(d => d.HasActiveSanctions, o => o.MapFrom(s => s.HasActiveSanctions))
            .ForMember(d => d.ActiveLoanCount, o => o.MapFrom(s => s.ActiveLoanCount))
            .ForMember(d => d.CareerName, o => o.MapFrom(s => s.Career != null ? s.Career.Name : null))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Career != null ? s.Career.Department.Name : null));

        CreateMap<Reservation, ReservationDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.AssetCode, o => o.MapFrom(s => s.Asset.Code))
            .ForMember(d => d.AssetName, o => o.MapFrom(s => s.Asset.Name))
            .ForMember(d => d.UserName, o => o.MapFrom(s => $"{s.User.FirstName} {s.User.LastName}"));

        CreateMap<Sanction, SanctionDto>()
            .ForMember(d => d.UserName, o => o.MapFrom(s => $"{s.User.FirstName} {s.User.LastName}"))
            .ForMember(d => d.UserEmail, o => o.MapFrom(s => s.User.InstitutionalEmail.Value));

        CreateMap<Incident, IncidentDto>()
            .ForMember(d => d.AssetName, o => o.MapFrom(s => s.Loan.Asset.Name))
            .ForMember(d => d.AssetCode, o => o.MapFrom(s => s.Loan.Asset.Code))
            .ForMember(d => d.AssetImageUrl, o => o.MapFrom(s => s.Loan.Asset.ImageUrl));

        CreateMap<Notification, NotificationDto>()
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()));

        CreateMap<Domain.ValueObjects.Email, string>()
            .ConvertUsing(src => src.Value);

        CreateMap<Contract, ContractDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}
