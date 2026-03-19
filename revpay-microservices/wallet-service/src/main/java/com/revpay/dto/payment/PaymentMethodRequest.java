package com.revpay.dto.payment;

import com.revpay.enums.PaymentMethodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentMethodRequest {

    @NotNull
    private PaymentMethodType type;

    @NotBlank(message = "Card/account identifier is required")
    private String maskedIdentifier;

    private String provider;
    private String expiryMonth;
    private String expiryYear;
    private boolean isDefault;
}