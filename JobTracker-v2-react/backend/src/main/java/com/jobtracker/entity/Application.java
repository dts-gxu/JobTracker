package com.jobtracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 投递记录实体类 - 存储求职投递信息
 * 
 * 状态选项: 准备中, 已投递, 笔试, 一面, 二面, 三面, HR面, Offer, 已拒绝
 * 投递渠道: 官网投递, 招聘网站, 内推, 校园招聘, 猎头推荐, 其他
 * 
 * @author dts
 * @version 2.0.0
 */
@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String positionName;

    @Column(nullable = false)
    private LocalDate applyDate;

    @Column(length = 30)
    @Builder.Default
    private String status = "已投递";

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Integer salaryMin;
    private Integer salaryMax;

    @Column(length = 100)
    private String workLocation;

    @Column(length = 50)
    private String applyChannel;

    @Column(length = 100)
    private String referrer;

    private LocalDateTime interviewTime;

    @Column(length = 500)
    private String companyWebsite;

    @Column(length = 100)
    private String hrContact;

    @Column(length = 20)
    private String hrPhone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private Boolean isStarred = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Priority {
        HIGH, MEDIUM, LOW
    }
}
