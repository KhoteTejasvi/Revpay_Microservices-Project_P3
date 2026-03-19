package com.revpay.client;

import com.revpay.dto.user.UserAccountInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/internal/account-info")
    UserAccountInfo getAccountInfo(@RequestParam("email") String email);
}