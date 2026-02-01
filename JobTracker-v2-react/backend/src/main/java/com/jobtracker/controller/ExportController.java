package com.jobtracker.controller;

import com.jobtracker.entity.Application;
import com.jobtracker.entity.User;
import com.jobtracker.repository.ApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 数据导出控制器 - @author dts
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElseThrow();
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(@AuthenticationPrincipal UserDetails userDetails) {
        List<Application> apps = applicationRepository.findByUserIdOrderByCreatedAtDesc(getUserId(userDetails));

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("投递记录");

            // 表头样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 表头
            String[] headers = {"公司名称", "职位名称", "投递日期", "状态", "薪资范围", "工作地点", "投递渠道", "内推人", "面试时间", "备注"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            // 数据
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            
            int rowNum = 1;
            for (Application app : apps) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(app.getCompanyName());
                row.createCell(1).setCellValue(app.getPositionName());
                row.createCell(2).setCellValue(app.getApplyDate() != null ? app.getApplyDate().format(dateFormatter) : "");
                row.createCell(3).setCellValue(app.getStatus());
                row.createCell(4).setCellValue(app.getSalaryMin() != null && app.getSalaryMax() != null ? 
                        app.getSalaryMin() + "-" + app.getSalaryMax() + "K" : "");
                row.createCell(5).setCellValue(app.getWorkLocation() != null ? app.getWorkLocation() : "");
                row.createCell(6).setCellValue(app.getApplyChannel() != null ? app.getApplyChannel() : "");
                row.createCell(7).setCellValue(app.getReferrer() != null ? app.getReferrer() : "");
                row.createCell(8).setCellValue(app.getInterviewTime() != null ? app.getInterviewTime().format(dateTimeFormatter) : "");
                row.createCell(9).setCellValue(app.getNotes() != null ? app.getNotes() : "");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            httpHeaders.setContentDispositionFormData("attachment", "job_applications.xlsx");

            return ResponseEntity.ok().headers(httpHeaders).body(out.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
