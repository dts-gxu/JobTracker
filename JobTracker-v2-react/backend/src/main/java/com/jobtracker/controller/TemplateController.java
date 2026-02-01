package com.jobtracker.controller;

import com.jobtracker.entity.Template;
import com.jobtracker.entity.User;
import com.jobtracker.repository.TemplateRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 投递模板控制器 - @author dts
 */
@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getTemplates(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(templateRepository.findByUserIdOrderByCreatedAtDesc(getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<?> createTemplate(@RequestBody Template template, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(getUserId(userDetails)).orElseThrow();
        template.setUser(user);
        template.setId(null);
        return ResponseEntity.ok(templateRepository.save(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Template template = templateRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(getUserId(userDetails)))
                .orElseThrow();
        templateRepository.delete(template);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
