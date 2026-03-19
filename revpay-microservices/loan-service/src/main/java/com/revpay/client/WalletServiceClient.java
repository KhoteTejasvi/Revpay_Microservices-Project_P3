package com.revpay.client;

import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.wallet.InternalCreditRequest;
import com.revpay.dto.wallet.InternalDebitRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@FeignClient(name = "wallet-service")
public interface WalletServiceClient {

    @PostMapping("/api/wallet/internal/credit")
    TransactionResponse credit(@RequestBody InternalCreditRequest req);

    @PostMapping("/api/wallet/internal/debit")
    TransactionResponse debit(@RequestBody InternalDebitRequest req);

    @GetMapping("/api/wallet/internal/balance")
    BigDecimal getBalance(@RequestParam("email") String email);
}