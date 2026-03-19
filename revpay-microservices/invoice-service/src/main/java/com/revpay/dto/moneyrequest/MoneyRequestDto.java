package com.revpay.dto.moneyrequest;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MoneyRequestDto {

    @NotBlank(message = "Payer email or account number is required")
    private String payerIdentifier;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    private String message;
}