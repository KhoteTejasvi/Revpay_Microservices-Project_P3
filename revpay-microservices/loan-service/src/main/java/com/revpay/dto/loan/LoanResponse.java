package com.revpay.dto.loan;

import com.revpay.dto.emi.EMIResponse;
import com.revpay.enums.LoanStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class LoanResponse {
    private Long id;
    private String loanNumber;
    private String borrowerName;
    private String borrowerEmail;
    private LoanStatus status;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private BigDecimal monthlyEmiAmount;
    private BigDecimal totalRepayableAmount;
    private BigDecimal amountRepaid;
    private String purpose;
    private LocalDate disbursementDate;
    private LocalDate closureDate;
    private Instant createdAt;

    public boolean isAutoDebit() {
        return autoDebit;
    }

    public void setAutoDebit(boolean autoDebit) {
        this.autoDebit = autoDebit;
    }

    private boolean autoDebit;
    private List<EMIResponse> emis;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLoanNumber() { return loanNumber; }
    public void setLoanNumber(String loanNumber) { this.loanNumber = loanNumber; }

    public String getBorrowerName() { return borrowerName; }
    public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }

    public String getBorrowerEmail() { return borrowerEmail; }
    public void setBorrowerEmail(String borrowerEmail) { this.borrowerEmail = borrowerEmail; }


    public LoanStatus getStatus() { return status; }
    public void setStatus(LoanStatus status) { this.status = status; }

    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public BigDecimal getMonthlyEmiAmount() { return monthlyEmiAmount; }
    public void setMonthlyEmiAmount(BigDecimal monthlyEmiAmount) { this.monthlyEmiAmount = monthlyEmiAmount; }

    public BigDecimal getTotalRepayableAmount() { return totalRepayableAmount; }
    public void setTotalRepayableAmount(BigDecimal totalRepayableAmount) { this.totalRepayableAmount = totalRepayableAmount; }

    public BigDecimal getAmountRepaid() { return amountRepaid; }
    public void setAmountRepaid(BigDecimal amountRepaid) { this.amountRepaid = amountRepaid; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public LocalDate getDisbursementDate() { return disbursementDate; }
    public void setDisbursementDate(LocalDate disbursementDate) { this.disbursementDate = disbursementDate; }

    public LocalDate getClosureDate() { return closureDate; }
    public void setClosureDate(LocalDate closureDate) { this.closureDate = closureDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<EMIResponse> getEmis() { return emis; }
    public void setEmis(List<EMIResponse> emis) { this.emis = emis; }
}