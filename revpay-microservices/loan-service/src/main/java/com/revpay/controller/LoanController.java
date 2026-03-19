package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.loan.ApplyLoanRequest;
import com.revpay.dto.loan.LoanResponse;
import com.revpay.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LoanResponse>> apply(
            @Valid @RequestBody ApplyLoanRequest req,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Loan application submitted",
                loanService.applyForLoan(email, req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getMyLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Loans",
                loanService.getMyLoans(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Loan",
                loanService.getLoanById(email, id)));
    }

    @PostMapping("/{loanId}/emis/{emiId}/repay")
    public ResponseEntity<ApiResponse<LoanResponse>> repayEmi(
            @PathVariable Long loanId,
            @PathVariable Long emiId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("EMI paid",
                loanService.repayEmi(email, loanId, emiId)));
    }
}