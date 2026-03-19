package com.revpay.controller;

import com.revpay.enums.InvoiceStatus;
import com.revpay.repository.InvoiceRepository;
import com.revpay.repository.MoneyRequestRepository;
import com.revpay.enums.MoneyRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class InvoiceInternalController {

    private final InvoiceRepository invoiceRepository;
    private final MoneyRequestRepository moneyRequestRepository;

    @GetMapping("/api/invoice/internal/pending-count")
    public ResponseEntity<Long> getPendingInvoiceCount(
            @RequestParam String email) {
        return ResponseEntity.ok(
                invoiceRepository.countByIssuerEmailAndStatus(
                        email, InvoiceStatus.SENT));
    }

    @GetMapping("/api/money-request/internal/pending-count")
    public ResponseEntity<Long> getPendingMoneyRequestCount(
            @RequestParam String email) {
        return ResponseEntity.ok(
                moneyRequestRepository.countByPayerEmailAndStatus(
                        email, MoneyRequestStatus.PENDING));
    }
}