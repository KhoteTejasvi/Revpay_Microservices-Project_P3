package com.revpay.entity;

import com.revpay.enums.PaymentMethodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "payment_methods",
        indexes = @Index(name = "idx_pm_user_email", columnList = "user_email"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethodType type;

    @Column(nullable = false)
    private String maskedIdentifier;

    private String provider;
    private String expiryMonth;
    private String expiryYear;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}