package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.invoice.CreateInvoiceRequest;
import com.revpay.dto.invoice.InvoiceResponse;
import com.revpay.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(
            @Valid @RequestBody CreateInvoiceRequest req,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice created",
                invoiceService.createInvoice(email, req)));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<InvoiceResponse>> send(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice sent",
                invoiceService.sendInvoice(email, id)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceResponse>> pay(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice paid",
                invoiceService.payInvoice(email, id)));
    }

    @GetMapping("/issued")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> issued(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Issued invoices",
                invoiceService.getMyInvoices(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> received(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Received invoices",
                invoiceService.getReceivedInvoices(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice",
                invoiceService.getById(email, id)));
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<ApiResponse<InvoiceResponse>> dispute(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice disputed",
                invoiceService.disputeInvoice(email, id,
                        body.getOrDefault("reason", "Disputed by recipient"))));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<InvoiceResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice cancelled",
                invoiceService.cancelInvoice(email, id)));
    }
}