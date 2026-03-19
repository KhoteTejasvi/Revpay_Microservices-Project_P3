package com.revpay.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "invoice-service", contextId = "invoiceClient")
public interface InvoiceServiceClient {

    @GetMapping("/api/invoice/internal/pending-count")
    long getPendingInvoiceCount(@RequestParam("email") String email);
}