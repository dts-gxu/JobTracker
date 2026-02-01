package com.jobtracker.repository;

import com.jobtracker.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Resume> findByUserIdAndIsDefaultTrue(Long userId);
}
