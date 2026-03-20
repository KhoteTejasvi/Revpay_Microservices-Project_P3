package com.revpay.client;

import com.revpay.dto.user.UserAccountInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/internal/account-info")
    UserAccountInfo getAccountInfo(@RequestParam("email") String email);

    @PostMapping("/api/users/internal/verify-pin")
    void verifyPin(@RequestParam("email") String email,
                   @RequestBody Map<String, String> pinRequest);
}
