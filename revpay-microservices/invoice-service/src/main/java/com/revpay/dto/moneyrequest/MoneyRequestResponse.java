package com.revpay.dto.moneyrequest;

import com.revpay.enums.MoneyRequestStatus;
import java.math.BigDecimal;
import java.time.Instant;

public class MoneyRequestResponse {
    private Long id;
    private BigDecimal amount;
    private String currency;
    private String message;
    private MoneyRequestStatus status;
    private String requesterEmail;
    private String requesterName;
    private String payerEmail;
    private String payerName;
    private Instant createdAt;
    private Instant expiresAt;

    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public BigDecimal getAmount()                    { return amount; }
    public void setAmount(BigDecimal v)              { this.amount = v; }
    public String getCurrency()                      { return currency; }
    public void setCurrency(String v)                { this.currency = v; }
    public String getMessage()                       { return message; }
    public void setMessage(String v)                 { this.message = v; }
    public MoneyRequestStatus getStatus()            { return status; }
    public void setStatus(MoneyRequestStatus v)      { this.status = v; }
    public String getRequesterEmail()                { return requesterEmail; }
    public void setRequesterEmail(String v)          { this.requesterEmail = v; }
    public String getRequesterName()                 { return requesterName; }
    public void setRequesterName(String v)           { this.requesterName = v; }
    public String getPayerEmail()                    { return payerEmail; }
    public void setPayerEmail(String v)              { this.payerEmail = v; }
    public String getPayerName()                     { return payerName; }
    public void setPayerName(String v)               { this.payerName = v; }
    public Instant getCreatedAt()                    { return createdAt; }
    public void setCreatedAt(Instant v)              { this.createdAt = v; }
    public Instant getExpiresAt()                    { return expiresAt; }
    public void setExpiresAt(Instant v)              { this.expiresAt = v; }
}