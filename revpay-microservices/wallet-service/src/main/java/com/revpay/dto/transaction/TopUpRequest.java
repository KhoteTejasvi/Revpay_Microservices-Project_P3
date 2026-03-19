package com.revpay.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TopUpRequest {

    @NotNull
    @DecimalMin(value = "1.00", message = "Minimum top-up is 1.00")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private Long paymentMethodId;

    private String description;
}