package com.revpay.dto.pin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SetPinRequest {

    @NotBlank
    @Pattern(regexp = "\\d{4}|\\d{6}", message = "PIN must be 4 or 6 digits")
    private String pin;

    @NotBlank
    private String confirmPin;

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    public String getConfirmPin() { return confirmPin; }
    public void setConfirmPin(String confirmPin) { this.confirmPin = confirmPin; }
}
