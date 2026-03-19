package com.revpay.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "loan-service")
public interface LoanServiceClient {

    @GetMapping("/api/loan/internal/active-count")
    long getActiveLoanCount(@RequestParam("email") String email);
}