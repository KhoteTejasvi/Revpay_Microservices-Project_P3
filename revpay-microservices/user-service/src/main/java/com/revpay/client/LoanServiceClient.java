package com.revpay.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "loan-service")
public interface LoanServiceClient {

    @GetMapping("/api/admin/loans/stats")
    java.util.Map<String, Object> getLoanStats();
}