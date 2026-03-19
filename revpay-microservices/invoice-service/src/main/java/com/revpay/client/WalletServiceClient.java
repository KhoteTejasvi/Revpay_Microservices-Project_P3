package com.revpay.client;

import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.wallet.InternalCreditRequest;
import com.revpay.dto.wallet.InternalDebitRequest;
import com.revpay.dto.wallet.InternalTransferRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "wallet-service")
public interface WalletServiceClient {

    @PostMapping("/api/wallet/internal/transfer")
    TransactionResponse transfer(@RequestBody InternalTransferRequest req);

    @PostMapping("/api/wallet/internal/credit")
    TransactionResponse credit(@RequestBody InternalCreditRequest req);

    @PostMapping("/api/wallet/internal/debit")
    TransactionResponse debit(@RequestBody InternalDebitRequest req);
}