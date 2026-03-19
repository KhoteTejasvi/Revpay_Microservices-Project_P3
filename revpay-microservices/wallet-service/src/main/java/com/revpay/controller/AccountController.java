package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.account.AccountResponse;
import com.revpay.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Accounts fetched",
                accountService.getMyAccounts(email)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Account fetched",
                accountService.getAccount(id, email)));
    }
}