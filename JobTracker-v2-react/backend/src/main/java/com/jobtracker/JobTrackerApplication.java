package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * JobTracker 求职投递追踪系统 - Spring Boot 启动类
 * 
 * @author dts
 * @version 2.0.0
 * @since 2025
 */
@SpringBootApplication
@EnableScheduling
public class JobTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobTrackerApplication.class, args);
    }
}
