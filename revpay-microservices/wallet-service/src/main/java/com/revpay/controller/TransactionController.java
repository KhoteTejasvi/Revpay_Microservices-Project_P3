package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.transaction.TopUpRequest;
import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.transaction.TransferRequest;
import com.revpay.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Transfer successful",
                transactionService.transfer(email, request)));
    }

    @PostMapping("/top-up")
    public ResponseEntity<ApiResponse<TransactionResponse>> topUp(
            @Valid @RequestBody TopUpRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Top-up successful",
                transactionService.topUp(email, request)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Transaction history",
                transactionService.getHistory(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Transactions",
                transactionService.getTransactions(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/export")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> exportTransactions(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Transactions",
                transactionService.getTransactionsForExport(email, fromDate, toDate)));
    }
}