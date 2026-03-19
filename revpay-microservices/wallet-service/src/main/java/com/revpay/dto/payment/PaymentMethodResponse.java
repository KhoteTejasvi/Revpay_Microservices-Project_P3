package com.revpay.dto.payment;

import com.revpay.enums.PaymentMethodType;

import java.time.Instant;

public class PaymentMethodResponse {
    private Long id;
    private PaymentMethodType type;
    private String maskedIdentifier;
    private String provider;
    private String expiryMonth;
    private String expiryYear;
    private boolean isDefault;
    private boolean verified;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PaymentMethodType getType() { return type; }
    public void setType(PaymentMethodType type) { this.type = type; }

    public String getMaskedIdentifier() { return maskedIdentifier; }
    public void setMaskedIdentifier(String maskedIdentifier) { this.maskedIdentifier = maskedIdentifier; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(String expiryMonth) { this.expiryMonth = expiryMonth; }

    public String getExpiryYear() { return expiryYear; }
    public void setExpiryYear(String expiryYear) { this.expiryYear = expiryYear; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}