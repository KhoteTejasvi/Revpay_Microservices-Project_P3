package com.revpay.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterPersonalRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
            message = "Password must contain uppercase, lowercase, digit, and special character"
    )
    private String password;

    @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number")
    private String phone;
}