package com.revpay.controller;

import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.wallet.InternalCreditRequest;
import com.revpay.dto.wallet.InternalDebitRequest;
import com.revpay.dto.wallet.InternalTransferRequest;
import com.revpay.service.WalletInternalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet/internal")
@RequiredArgsConstructor
public class WalletInternalController {

    private final WalletInternalService walletInternalService;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @RequestBody InternalTransferRequest req) {
        return ResponseEntity.ok(walletInternalService.transfer(req));
    }

    @PostMapping("/credit")
    public ResponseEntity<TransactionResponse> credit(
            @RequestBody InternalCreditRequest req) {
        return ResponseEntity.ok(walletInternalService.credit(req));
    }

    @PostMapping("/debit")
    public ResponseEntity<TransactionResponse> debit(
            @RequestBody InternalDebitRequest req) {
        return ResponseEntity.ok(walletInternalService.debit(req));
    }

    @GetMapping("/balance")
    public ResponseEntity<java.math.BigDecimal> getBalance(
            @RequestParam String email) {
        com.revpay.entity.Account account = walletInternalService.getAccountByEmail(email);
        return ResponseEntity.ok(account.getBalance());
    }
}