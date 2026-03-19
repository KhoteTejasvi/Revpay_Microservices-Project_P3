package com.revpay.entity;

import com.revpay.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_email_read", columnList = "user_email, isRead")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    private String actionUrl;
    private Long referenceId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    private Instant readAt;
}