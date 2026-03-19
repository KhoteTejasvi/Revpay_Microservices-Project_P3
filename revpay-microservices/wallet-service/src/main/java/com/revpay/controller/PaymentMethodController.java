package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.payment.PaymentMethodRequest;
import com.revpay.dto.payment.PaymentMethodResponse;
import com.revpay.service.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments/methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getAll(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Payment methods",
                paymentMethodService.getMyPaymentMethods(email)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> add(
            @Valid @RequestBody PaymentMethodRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Payment method added",
                paymentMethodService.addPaymentMethod(email, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        paymentMethodService.deletePaymentMethod(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Payment method removed"));
    }
}