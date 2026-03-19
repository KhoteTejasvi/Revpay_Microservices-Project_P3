package com.revpay.entity;

import com.revpay.enums.MoneyRequestStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "money_requests")
public class MoneyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoneyRequestStatus status = MoneyRequestStatus.PENDING;

    private Instant expiresAt;

    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;

    @Column(name = "payer_email", nullable = false)
    private String payerEmail;

    // Store reference number instead of Transaction FK
    @Column(name = "tx_reference_number")
    private String txReferenceNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public MoneyRequest() {}

    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }
    public BigDecimal getAmount()                { return amount; }
    public void setAmount(BigDecimal v)          { this.amount = v; }
    public String getCurrency()                  { return currency; }
    public void setCurrency(String v)            { this.currency = v; }
    public String getMessage()                   { return message; }
    public void setMessage(String v)             { this.message = v; }
    public MoneyRequestStatus getStatus()        { return status; }
    public void setStatus(MoneyRequestStatus v)  { this.status = v; }
    public Instant getExpiresAt()                { return expiresAt; }
    public void setExpiresAt(Instant v)          { this.expiresAt = v; }
    public String getRequesterEmail()            { return requesterEmail; }
    public void setRequesterEmail(String v)      { this.requesterEmail = v; }
    public String getPayerEmail()                { return payerEmail; }
    public void setPayerEmail(String v)          { this.payerEmail = v; }
    public String getTxReferenceNumber()         { return txReferenceNumber; }
    public void setTxReferenceNumber(String v)   { this.txReferenceNumber = v; }
    public Instant getCreatedAt()                { return createdAt; }
    public Instant getUpdatedAt()                { return updatedAt; }
}