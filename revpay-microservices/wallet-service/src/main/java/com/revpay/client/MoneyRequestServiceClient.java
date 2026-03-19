package com.revpay.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "invoice-service", contextId = "moneyRequestClient")
public interface MoneyRequestServiceClient {

    @GetMapping("/api/money-request/internal/pending-count")
    long getPendingMoneyRequestCount(@RequestParam("email") String email);
}