package com.revpay.service;

import com.revpay.common.RevPayException;
import com.revpay.dto.auth.*;
import com.revpay.entity.Account;
import com.revpay.entity.User;
import com.revpay.enums.AccountType;
import com.revpay.enums.Role;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.UserRepository;
import com.revpay.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse registerPersonal(RegisterPersonalRequest req) {
        validateEmailUnique(req.getEmail());
        validatePhoneUnique(req.getPhone());

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.PERSONAL)
                .build();

        userRepository.save(user);
        Account account = createDefaultAccount(user, AccountType.WALLET);
        log.info("Personal user registered: {}", user.getEmail());
        return buildAuthResponse(user, account);
    }

    @Transactional
    public AuthResponse registerBusiness(RegisterBusinessRequest req) {
        validateEmailUnique(req.getEmail());
        validatePhoneUnique(req.getPhone());

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.BUSINESS)
                .build();

        userRepository.save(user);
        Account account = createDefaultAccount(user, AccountType.BUSINESS);
        log.info("Business user registered: {}", user.getEmail());
        return buildAuthResponse(user, account);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailWithAccounts(req.getEmail().toLowerCase())
                .orElseThrow(() -> RevPayException.notFound("User not found"));

        if (!user.isEnabled()) {
            throw RevPayException.forbidden("Account is disabled. Please contact support.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getEmail().toLowerCase(),
                        req.getPassword()
                )
        );

        Account primaryAccount = user.getAccounts().stream()
                .findFirst()
                .orElseThrow(() -> RevPayException.notFound("No account found for user"));

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, primaryAccount);
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setResetToken(token);
            user.setResetTokenExpiry(Instant.now().plusSeconds(3600));
            userRepository.save(user);

            System.out.println("=================================================");
            System.out.println("PASSWORD RESET for: " + email);
            System.out.println("Token: " + token);
            System.out.println("URL: http://localhost:4200/auth/reset-password?token=" + token);
            System.out.println("=================================================");
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> RevPayException.badRequest("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw RevPayException.badRequest("Reset token has expired. Please request a new one.");
        }
        if (newPassword.length() < 8) {
            throw RevPayException.badRequest("Password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Account createDefaultAccount(User user, AccountType type) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(type)
                .user(user)
                .build();
        return accountRepository.save(account);
    }

    private AuthResponse buildAuthResponse(User user, Account account) {
        String token = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setAccountId(account != null ? account.getId() : null);
        return response;
    }

    private void validateEmailUnique(String email) {
        if (userRepository.existsByEmail(email.toLowerCase())) {
            throw RevPayException.conflict("Email is already registered: " + email);
        }
    }

    private void validatePhoneUnique(String phone) {
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw RevPayException.conflict("Phone number is already registered");
        }
    }

    private String generateAccountNumber() {
        String candidate;
        do {
            candidate = "REV" + String.format("%010d",
                    (long) (Math.random() * 9_000_000_000L) + 1_000_000_000L);
        } while (accountRepository.existsByAccountNumber(candidate));
        return candidate;
    }
}