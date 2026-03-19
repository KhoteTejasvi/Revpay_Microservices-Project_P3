package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.auth.AuthResponse;
import com.revpay.dto.auth.LoginRequest;
import com.revpay.dto.auth.RegisterBusinessRequest;
import com.revpay.dto.auth.RegisterPersonalRequest;
import com.revpay.dto.forgotPassword.ForgotPasswordRequest;
import com.revpay.dto.forgotPassword.ResetPasswordRequest;
import com.revpay.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/personal")
    public ResponseEntity<ApiResponse<AuthResponse>> registerPersonal(
            @Valid @RequestBody RegisterPersonalRequest request) {
        AuthResponse response = authService.registerPersonal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Personal account created successfully", response));
    }

    @PostMapping("/register/business")
    public ResponseEntity<ApiResponse<AuthResponse>> registerBusiness(
            @Valid @RequestBody RegisterBusinessRequest request) {
        AuthResponse response = authService.registerBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Business account created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(
                "If that email exists, a reset link has been sent.", "OK"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully.", "OK"));
    }
}