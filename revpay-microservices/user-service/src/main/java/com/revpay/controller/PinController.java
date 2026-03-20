package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.pin.PinStatusResponse;
import com.revpay.dto.pin.SetPinRequest;
import com.revpay.dto.pin.VerifyPinRequest;
import com.revpay.service.PinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class PinController {

    private final PinService pinService;

    @PostMapping("/set-pin")
    public ResponseEntity<ApiResponse<String>> setPin(
            @Valid @RequestBody SetPinRequest req,
            @AuthenticationPrincipal String email) {
        pinService.setPin(email, req);
        return ResponseEntity.ok(ApiResponse.ok("Transaction PIN set successfully", "OK"));
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<ApiResponse<String>> verifyPin(
            @Valid @RequestBody VerifyPinRequest req,
            @AuthenticationPrincipal String email) {
        pinService.verifyPin(email, req);
        return ResponseEntity.ok(ApiResponse.ok("PIN verified", "OK"));
    }

    @GetMapping("/pin-status")
    public ResponseEntity<ApiResponse<PinStatusResponse>> pinStatus(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("PIN status",
                pinService.getPinStatus(email)));
    }

    @PostMapping("/change-pin")
    public ResponseEntity<ApiResponse<String>> changePin(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String email) {
        pinService.changePin(email,
                body.get("oldPin"),
                body.get("newPin"),
                body.get("confirmPin"));
        return ResponseEntity.ok(ApiResponse.ok("PIN changed successfully", "OK"));
    }

    // Internal endpoint — called by other microservices via Feign (no JWT needed)
    @PostMapping("/internal/verify-pin")
    public ResponseEntity<ApiResponse<String>> verifyPinInternal(
            @RequestParam String email,
            @RequestBody VerifyPinRequest req) {
        pinService.verifyPin(email, req);
        return ResponseEntity.ok(ApiResponse.ok("PIN verified", "OK"));
    }
}
