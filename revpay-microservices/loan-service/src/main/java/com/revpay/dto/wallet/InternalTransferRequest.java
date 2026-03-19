package com.revpay.dto.wallet;

import java.math.BigDecimal;

public class InternalTransferRequest {
    private String senderEmail;
    private String receiverEmail;
    private BigDecimal amount;
    private String description;
    private String transactionType; // TRANSFER, INVOICE_PAYMENT, MONEY_REQUEST_FULFILLMENT

    public String getSenderEmail()              { return senderEmail; }
    public void setSenderEmail(String v)        { this.senderEmail = v; }
    public String getReceiverEmail()            { return receiverEmail; }
    public void setReceiverEmail(String v)      { this.receiverEmail = v; }
    public BigDecimal getAmount()               { return amount; }
    public void setAmount(BigDecimal v)         { this.amount = v; }
    public String getDescription()              { return description; }
    public void setDescription(String v)        { this.description = v; }
    public String getTransactionType()          { return transactionType; }
    public void setTransactionType(String v)    { this.transactionType = v; }
}