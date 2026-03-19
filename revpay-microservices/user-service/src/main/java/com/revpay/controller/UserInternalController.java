package com.revpay.controller;

import com.revpay.common.RevPayException;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.entity.Account;
import com.revpay.entity.User;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/internal")
@RequiredArgsConstructor
public class UserInternalController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    /**
     * Called by wallet-service (Feign) to get account info for a given email.
     * Not exposed to the internet — only reachable service-to-service.
     */
    @GetMapping("/account-info")
    public ResponseEntity<UserAccountInfo> getAccountInfo(
            @RequestParam String email) {

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> RevPayException.notFound("User not found: " + email));

        Account account = accountRepository.findByUserId(user.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> RevPayException.notFound("No account for user: " + email));

        return ResponseEntity.ok(new UserAccountInfo(
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                account.getAccountNumber(),
                account.getAccountType().name()
        ));
    }
}