package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.emi.EMIResponse;
import com.revpay.service.EMIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emis")
@RequiredArgsConstructor
public class EMIController {

    private final EMIService emiService;

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<ApiResponse<List<EMIResponse>>> getSchedule(
            @PathVariable Long loanId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("EMI schedule",
                emiService.getEmiSchedule(email, loanId)));
    }

    @PostMapping("/{emiId}/pay")
    public ResponseEntity<ApiResponse<EMIResponse>> payEmi(
            @PathVariable Long emiId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("EMI paid",
                emiService.payEmi(email, emiId)));
    }

    @PostMapping("/loan/{loanId}/auto-debit/toggle")
    public ResponseEntity<ApiResponse<String>> toggleAutoDebit(
            @PathVariable Long loanId,
            @AuthenticationPrincipal String email) {
        emiService.toggleAutoDebit(email, loanId);
        return ResponseEntity.ok(ApiResponse.ok("Auto-debit toggled", "OK"));
    }
}