package com.revpay.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TopUpRequest {

    @NotNull
    @DecimalMin(value = "1.00", message = "Minimum top-up is 1.00")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private Long paymentMethodId;

    private String description;

    @NotBlank(message = "Transaction PIN is required")
    private String transactionPin;

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Long getPaymentMethodId() { return paymentMethodId; }
    public void setPaymentMethodId(Long paymentMethodId) { this.paymentMethodId = paymentMethodId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTransactionPin() { return transactionPin; }
    public void setTransactionPin(String transactionPin) { this.transactionPin = transactionPin; }
}
