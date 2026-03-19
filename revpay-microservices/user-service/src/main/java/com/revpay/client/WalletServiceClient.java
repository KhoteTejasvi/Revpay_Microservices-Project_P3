package com.revpay.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

@FeignClient(name = "wallet-service")
public interface WalletServiceClient {

    @GetMapping("/api/wallet/internal/balance")
    BigDecimal getBalance(@RequestParam("email") String email);
}