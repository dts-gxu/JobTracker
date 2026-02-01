package com.jobtracker.controller;

import com.jobtracker.dto.ApplicationDTO;
import com.jobtracker.entity.User;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 投递记录控制器 - 处理CRUD操作和统计
 * 
 * @author dts
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(User::getId).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getApplications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(applicationService.getApplications(getUserId(userDetails), status, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getApplication(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationById(id, getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<?> createApplication(@Valid @RequestBody ApplicationDTO dto, 
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.createApplication(dto, getUserId(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(@PathVariable Long id, @Valid @RequestBody ApplicationDTO dto,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.updateApplication(id, dto, getUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        applicationService.deleteApplication(id, getUserId(userDetails));
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @PostMapping("/{id}/toggle-star")
    public ResponseEntity<?> toggleStar(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.toggleStar(id, getUserId(userDetails)));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getStatistics(getUserId(userDetails)));
    }
}
