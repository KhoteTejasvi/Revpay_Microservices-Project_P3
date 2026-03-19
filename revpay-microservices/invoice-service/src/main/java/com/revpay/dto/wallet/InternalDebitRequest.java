package com.revpay.dto.wallet;

import java.math.BigDecimal;

public class InternalDebitRequest {
    private String email;
    private BigDecimal amount;
    private String description;
    private String transactionType;

    public String getEmail()                 { return email; }
    public void setEmail(String v)           { this.email = v; }
    public BigDecimal getAmount()            { return amount; }
    public void setAmount(BigDecimal v)      { this.amount = v; }
    public String getDescription()           { return description; }
    public void setDescription(String v)     { this.description = v; }
    public String getTransactionType()       { return transactionType; }
    public void setTransactionType(String v) { this.transactionType = v; }
}