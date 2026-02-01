package com.jobtracker.service;

import com.jobtracker.dto.ApplicationDTO;
import com.jobtracker.entity.Application;
import com.jobtracker.entity.User;
import com.jobtracker.repository.ApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 投递记录服务层 - 塲理业务逻辑
 * 
 * @author dts
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public Page<ApplicationDTO> getApplications(Long userId, String status, String keyword, Pageable pageable) {
        Page<Application> apps;
        if (keyword != null && !keyword.isEmpty()) {
            apps = applicationRepository.searchByKeyword(userId, keyword, pageable);
        } else if (status != null && !status.isEmpty()) {
            apps = applicationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else {
            apps = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        return apps.map(ApplicationDTO::fromEntity);
    }

    public ApplicationDTO getApplicationById(Long id, Long userId) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return ApplicationDTO.fromEntity(app);
    }

    @Transactional
    public ApplicationDTO createApplication(ApplicationDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Application app = Application.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .positionName(dto.getPositionName())
                .applyDate(dto.getApplyDate())
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .workLocation(dto.getWorkLocation())
                .applyChannel(dto.getApplyChannel())
                .referrer(dto.getReferrer())
                .interviewTime(dto.getInterviewTime())
                .companyWebsite(dto.getCompanyWebsite())
                .hrContact(dto.getHrContact())
                .hrPhone(dto.getHrPhone())
                .priority(Application.Priority.valueOf(dto.getPriority()))
                .isStarred(dto.getIsStarred())
                .build();
        
        return ApplicationDTO.fromEntity(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationDTO updateApplication(Long id, ApplicationDTO dto, Long userId) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        app.setCompanyName(dto.getCompanyName());
        app.setPositionName(dto.getPositionName());
        app.setApplyDate(dto.getApplyDate());
        app.setStatus(dto.getStatus());
        app.setNotes(dto.getNotes());
        app.setSalaryMin(dto.getSalaryMin());
        app.setSalaryMax(dto.getSalaryMax());
        app.setWorkLocation(dto.getWorkLocation());
        app.setApplyChannel(dto.getApplyChannel());
        app.setReferrer(dto.getReferrer());
        app.setInterviewTime(dto.getInterviewTime());
        app.setCompanyWebsite(dto.getCompanyWebsite());
        app.setHrContact(dto.getHrContact());
        app.setHrPhone(dto.getHrPhone());
        app.setPriority(Application.Priority.valueOf(dto.getPriority()));
        app.setIsStarred(dto.getIsStarred());
        
        return ApplicationDTO.fromEntity(applicationRepository.save(app));
    }

    @Transactional
    public void deleteApplication(Long id, Long userId) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Application not found"));
        applicationRepository.delete(app);
    }

    @Transactional
    public ApplicationDTO toggleStar(Long id, Long userId) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setIsStarred(!app.getIsStarred());
        return ApplicationDTO.fromEntity(applicationRepository.save(app));
    }

    public Map<String, Object> getStatistics(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", applicationRepository.countByUserId(userId));
        
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : applicationRepository.countByStatusForUser(userId)) {
            byStatus.put((String) row[0], (Long) row[1]);
        }
        stats.put("byStatus", byStatus);
        
        List<ApplicationDTO> starred = applicationRepository.findByUserIdAndIsStarredTrue(userId)
                .stream().map(ApplicationDTO::fromEntity).collect(Collectors.toList());
        stats.put("starred", starred);
        
        return stats;
    }
}
