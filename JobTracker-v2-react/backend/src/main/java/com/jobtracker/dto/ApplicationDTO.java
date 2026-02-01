package com.jobtracker.dto;

import com.jobtracker.entity.Application;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ApplicationDTO {
    private Long id;
    
    @NotBlank(message = "Company name is required")
    private String companyName;
    
    @NotBlank(message = "Position name is required")
    private String positionName;
    
    @NotNull(message = "Apply date is required")
    private LocalDate applyDate;
    
    private String status = "已投递";
    private String notes;
    private Integer salaryMin;
    private Integer salaryMax;
    private String workLocation;
    private String applyChannel;
    private String referrer;
    private LocalDateTime interviewTime;
    private String companyWebsite;
    private String hrContact;
    private String hrPhone;
    private String priority = "MEDIUM";
    private Boolean isStarred = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ApplicationDTO fromEntity(Application app) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(app.getId());
        dto.setCompanyName(app.getCompanyName());
        dto.setPositionName(app.getPositionName());
        dto.setApplyDate(app.getApplyDate());
        dto.setStatus(app.getStatus());
        dto.setNotes(app.getNotes());
        dto.setSalaryMin(app.getSalaryMin());
        dto.setSalaryMax(app.getSalaryMax());
        dto.setWorkLocation(app.getWorkLocation());
        dto.setApplyChannel(app.getApplyChannel());
        dto.setReferrer(app.getReferrer());
        dto.setInterviewTime(app.getInterviewTime());
        dto.setCompanyWebsite(app.getCompanyWebsite());
        dto.setHrContact(app.getHrContact());
        dto.setHrPhone(app.getHrPhone());
        dto.setPriority(app.getPriority().name());
        dto.setIsStarred(app.getIsStarred());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        return dto;
    }
}
