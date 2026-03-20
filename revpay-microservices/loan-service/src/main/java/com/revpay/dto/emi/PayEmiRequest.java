package com.revpay.dto.emi;

import jakarta.validation.constraints.NotBlank;

public class PayEmiRequest {

    @NotBlank(message = "Transaction PIN is required")
    private String transactionPin;

    public String getTransactionPin() { return transactionPin; }
    public void setTransactionPin(String transactionPin) { this.transactionPin = transactionPin; }
}
