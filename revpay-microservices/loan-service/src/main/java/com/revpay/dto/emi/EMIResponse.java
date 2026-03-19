package com.revpay.dto.emi;

import com.revpay.enums.EMIStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EMIResponse {
    private Long id;
    private Integer instalmentNumber;
    private BigDecimal amount;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;

    public BigDecimal getFineAmount() {
        return FineAmount;
    }

    public void setFineAmount(BigDecimal fineAmount) {
        FineAmount = fineAmount;
    }

    private BigDecimal FineAmount;

    public BigDecimal getTotalDue() {
        return totalDue;
    }

    public void setTotalDue(BigDecimal totalDue) {
        this.totalDue = totalDue;
    }

    private BigDecimal totalDue;  //amt+fine
    private LocalDate dueDate;
    private LocalDate paidDate;
    private EMIStatus status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getInstalmentNumber() { return instalmentNumber; }
    public void setInstalmentNumber(Integer instalmentNumber) { this.instalmentNumber = instalmentNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getPrincipalComponent() { return principalComponent; }
    public void setPrincipalComponent(BigDecimal principalComponent) { this.principalComponent = principalComponent; }

    public BigDecimal getInterestComponent() { return interestComponent; }
    public void setInterestComponent(BigDecimal interestComponent) { this.interestComponent = interestComponent; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public EMIStatus getStatus() { return status; }
    public void setStatus(EMIStatus status) { this.status = status; }
}