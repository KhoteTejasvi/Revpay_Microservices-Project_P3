package com.revpay.controller;

import com.revpay.enums.LoanStatus;
import com.revpay.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LoanInternalController {

    private final LoanRepository loanRepository;

    @GetMapping("/api/loan/internal/active-count")
    public ResponseEntity<Long> getActiveLoanCount(
            @RequestParam String email) {
        return ResponseEntity.ok(
                loanRepository.countByBorrowerEmailAndStatus(
                        email, LoanStatus.ACTIVE));
    }
}