package com.revpay.entity;

import com.revpay.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans",
        indexes = @Index(name = "idx_loan_borrower_email", columnList = "borrower_email"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String loanNumber;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal principalAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal monthlyEmiAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal totalRepayableAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal amountRepaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.APPLIED;

    private String purpose;
    private LocalDate disbursementDate;
    private LocalDate closureDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean autoDebit = false;

    // Email instead of User FK
    @Column(name = "borrower_email", nullable = false)
    private String borrowerEmail;

    // Borrower name cached to avoid Feign call on every list
    @Column(name = "borrower_name")
    private String borrowerName;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EMI> emis = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}