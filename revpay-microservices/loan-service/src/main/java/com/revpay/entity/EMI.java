package com.revpay.entity;

import com.revpay.enums.EMIStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "emis")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EMI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instalment_number", nullable = false)
    private Integer instalmentNumber;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal principalComponent;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal interestComponent;

    @Column(precision = 19, scale = 4)
    private BigDecimal fineAmount;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EMIStatus status = EMIStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    // Store tx reference instead of FK
    @Column(name = "tx_reference_number")
    private String txReferenceNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}