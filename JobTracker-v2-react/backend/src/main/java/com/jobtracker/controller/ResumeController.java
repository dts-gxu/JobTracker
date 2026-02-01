package com.jobtracker.controller;

import com.jobtracker.entity.Resume;
import com.jobtracker.entity.User;
import com.jobtracker.repository.ResumeRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * 简历管理控制器 - @author dts
 */
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getResumes(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeRepository.findByUserIdOrderByCreatedAtDesc(getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Long userId = getUserId(userDetails);
            User user = userRepository.findById(userId).orElseThrow();
            
            String uploadDir = "uploads/resumes/" + userId;
            Files.createDirectories(Paths.get(uploadDir));
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Resume resume = Resume.builder()
                    .user(user)
                    .name(name)
                    .description(description)
                    .filePath(filePath.toString())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .isDefault(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).isEmpty())
                    .build();

            return ResponseEntity.ok(resumeRepository.save(resume));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "上传失败: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Resume resume = resumeRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(getUserId(userDetails)))
                .orElseThrow();
        
        try {
            Files.deleteIfExists(Paths.get(resume.getFilePath()));
        } catch (IOException ignored) {}
        
        resumeRepository.delete(resume);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }

    @PostMapping("/{id}/set-default")
    public ResponseEntity<?> setDefault(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        
        resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).forEach(r -> {
            r.setIsDefault(r.getId().equals(id));
            resumeRepository.save(r);
        });
        
        return ResponseEntity.ok(Map.of("message", "设置成功"));
    }
}
