package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.loan.LoanResponse;
import com.revpay.service.AdminLoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/loans")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminLoanController {

    private final AdminLoanService adminLoanService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getLoans(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Loans",
                adminLoanService.getAllLoans(status,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LoanResponse>> approveLoan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Loan approved",
                adminLoanService.approveLoan(id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LoanResponse>> rejectLoan(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Loan rejected",
                adminLoanService.rejectLoan(id,
                        body.getOrDefault("reason", "Rejected by admin"))));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Loan stats",
                Map.of("pendingLoans", adminLoanService.getPendingLoansCount())));
    }
}