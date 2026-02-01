package com.jobtracker.repository;

import com.jobtracker.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Application> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<Application> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId AND " +
           "(LOWER(a.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.positionName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Application> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.user.id = :userId GROUP BY a.status")
    List<Object[]> countByStatusForUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    List<Application> findByUserIdAndIsStarredTrue(Long userId);
    
    @Query("SELECT FUNCTION('DATE_FORMAT', a.applyDate, '%Y-%m') as month, COUNT(a) as count " +
           "FROM Application a WHERE a.user.id = :userId GROUP BY FUNCTION('DATE_FORMAT', a.applyDate, '%Y-%m') " +
           "ORDER BY month DESC")
    List<Object[]> countByMonthForUser(@Param("userId") Long userId);
}
