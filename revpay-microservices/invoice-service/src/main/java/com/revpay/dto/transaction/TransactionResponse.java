package com.revpay.dto.transaction;

import com.revpay.enums.TransactionStatus;
import com.revpay.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public class TransactionResponse {
    private Long id;
    private String referenceNumber;
    private TransactionType type;
    private TransactionStatus status;
    private BigDecimal amount;
    private BigDecimal fee;
    private String currency;
    private String description;
    private String note;
    private Long senderAccountId;
    private String senderAccountNumber;
    private Long receiverAccountId;
    private String receiverAccountNumber;
    private Instant createdAt;
    private Instant completedAt;
    private boolean Credit;

    public boolean isCredit() {
        return Credit;
    }

    public void setCredit(boolean credit) {
        Credit = credit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(Long senderAccountId) { this.senderAccountId = senderAccountId; }

    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }

    public Long getReceiverAccountId() { return receiverAccountId; }
    public void setReceiverAccountId(Long receiverAccountId) { this.receiverAccountId = receiverAccountId; }

    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}