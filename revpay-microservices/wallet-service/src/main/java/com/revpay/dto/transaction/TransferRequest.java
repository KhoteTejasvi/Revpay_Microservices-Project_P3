package com.revpay.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TransferRequest {

    @NotBlank @Email
    private String receiverEmail;     // ← changed from receiverAccountNumber

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    private String note;
    private String description;

    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}