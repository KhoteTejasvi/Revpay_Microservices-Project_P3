package com.revpay.repository;

import com.revpay.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserEmailOrderByCreatedAtDesc(String email, Pageable pageable);
    long countByUserEmailAndIsRead(String email, boolean isRead);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.userEmail = :email AND n.isRead = false")
    void markAllAsRead(@Param("email") String email);
}