package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.moneyrequest.MoneyRequestDto;
import com.revpay.dto.moneyrequest.MoneyRequestResponse;
import com.revpay.service.MoneyRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/money-requests")
@RequiredArgsConstructor
public class MoneyRequestController {

    private final MoneyRequestService moneyRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<MoneyRequestResponse>> sendRequest(
            @Valid @RequestBody MoneyRequestDto dto,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Money request sent",
                moneyRequestService.sendRequest(email, dto)));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<MoneyRequestResponse>> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Request accepted",
                moneyRequestService.acceptRequest(email, id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<MoneyRequestResponse>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Request rejected",
                moneyRequestService.rejectRequest(email, id)));
    }

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<Page<MoneyRequestResponse>>> sent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Sent requests",
                moneyRequestService.getSentRequests(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<Page<MoneyRequestResponse>>> received(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Received requests",
                moneyRequestService.getReceivedRequests(email,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }
}