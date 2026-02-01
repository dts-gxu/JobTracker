package com.jobtracker.service;

import com.jobtracker.entity.Application;
import com.jobtracker.entity.User;
import com.jobtracker.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 邮件提醒服务 - 发送面试时间提醒邮件
 * 
 * @author dts
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final ApplicationRepository applicationRepository;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${reminder.hours-before:24}")
    private int hoursBeforeReminder;

    /**
     * 发送面试提醒邮件
     */
    public void sendInterviewReminder(User user, Application app) {
        if (fromEmail.isEmpty() || user.getEmail() == null) {
            log.warn("邮件配置不完整，跳过发送提醒");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("【JobTracker】面试提醒 - " + app.getCompanyName());
            
            String content = String.format(
                "亲爱的 %s：\n\n" +
                "您有一场面试即将开始，请注意准备！\n\n" +
                "📌 公司：%s\n" +
                "💼 职位：%s\n" +
                "🕐 时间：%s\n" +
                "📊 当前状态：%s\n" +
                "📝 备注：%s\n\n" +
                "祝您面试顺利！\n\n" +
                "—— JobTracker 求职投递追踪系统",
                user.getRealName() != null ? user.getRealName() : user.getUsername(),
                app.getCompanyName(),
                app.getPositionName(),
                app.getInterviewTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                app.getStatus(),
                app.getNotes() != null ? app.getNotes() : "无"
            );
            
            message.setText(content);
            mailSender.send(message);
            log.info("已发送面试提醒邮件给: {} - {}", user.getEmail(), app.getCompanyName());
        } catch (Exception e) {
            log.error("发送邮件失败: {}", e.getMessage());
        }
    }

    /**
     * 定时任务：每小时检查即将到来的面试
     */
    @Scheduled(fixedRate = 3600000) // 每小时执行一次
    public void checkUpcomingInterviews() {
        log.info("检查即将到来的面试...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusHours(hoursBeforeReminder);
        
        // 查找所有在提醒时间范围内的面试
        List<Application> upcomingInterviews = applicationRepository.findAll().stream()
            .filter(app -> app.getInterviewTime() != null)
            .filter(app -> {
                LocalDateTime interviewTime = app.getInterviewTime();
                return interviewTime.isAfter(now) && interviewTime.isBefore(reminderTime);
            })
            .toList();

        for (Application app : upcomingInterviews) {
            sendInterviewReminder(app.getUser(), app);
        }
        
        log.info("检查完成，共发送 {} 条面试提醒", upcomingInterviews.size());
    }
}
