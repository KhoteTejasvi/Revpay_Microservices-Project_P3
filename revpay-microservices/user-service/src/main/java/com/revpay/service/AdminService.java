package com.revpay.service;

import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.admin.AdminUserResponse;
import com.revpay.entity.User;
import com.revpay.enums.Role;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final WalletServiceClient walletServiceClient;

    public AdminService(UserRepository userRepository,
                        AccountRepository accountRepository,
                        WalletServiceClient walletServiceClient) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.walletServiceClient = walletServiceClient;
    }

    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByRoleNot(Role.ADMIN, pageable)
                .map(this::toResponse);
    }

    public AdminUserResponse getUserById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("User not found")));
    }

    public AdminUserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw RevPayException.badRequest("Cannot disable admin accounts");
        }
        user.setEnabled(!user.isEnabled());
        return toResponse(userRepository.save(user));
    }

    public long getTotalUsers() {
        return userRepository.countByRoleNot(Role.ADMIN);
    }

    public long getTotalByRole(String role) {
        return userRepository.countByRole(Role.valueOf(role));
    }

    private AdminUserResponse toResponse(User user) {
        AdminUserResponse r = new AdminUserResponse();
        r.setId(user.getId());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole());
        r.setEnabled(user.isEnabled());
        r.setCreatedAt(user.getCreatedAt());

        // Get account number from user-service DB
        accountRepository.findByUserId(user.getId())
                .stream().findFirst().ifPresent(acc ->
                        r.setAccountNumber(acc.getAccountNumber()));

        // Get real balance from wallet-service
        try {
            BigDecimal balance = walletServiceClient.getBalance(user.getEmail());
            r.setBalance(balance);
        } catch (Exception e) {
            log.warn("Could not fetch balance for {}: {}", user.getEmail(), e.getMessage());
            r.setBalance(BigDecimal.ZERO);
        }

        return r;
    }
}

//package com.revpay.service;
//
//import com.revpay.common.RevPayException;
//import com.revpay.dto.admin.AdminUserResponse;
//import com.revpay.entity.User;
//import com.revpay.enums.Role;
//import com.revpay.repository.AccountRepository;
//import com.revpay.repository.UserRepository;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AdminService {
//
//    private final UserRepository userRepository;
//    private final AccountRepository accountRepository;
//
//    public AdminService(UserRepository userRepository,
//                        AccountRepository accountRepository) {
//        this.userRepository = userRepository;
//        this.accountRepository = accountRepository;
//    }
//
//    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
//        return userRepository.findByRoleNot(Role.ADMIN, pageable)
//                .map(this::toResponse);
//    }
//
//    public AdminUserResponse getUserById(Long id) {
//        return toResponse(userRepository.findById(id)
//                .orElseThrow(() -> RevPayException.notFound("User not found")));
//    }
//
//    public AdminUserResponse toggleUserStatus(Long id) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> RevPayException.notFound("User not found"));
//        if (user.getRole() == Role.ADMIN) {
//            throw RevPayException.badRequest("Cannot disable admin accounts");
//        }
//        user.setEnabled(!user.isEnabled());
//        return toResponse(userRepository.save(user));
//    }
//
//    public long getTotalUsers() {
//        return userRepository.countByRoleNot(Role.ADMIN);
//    }
//
//    public long getTotalByRole(String role) {
//        return userRepository.countByRole(Role.valueOf(role));
//    }
//
//    private AdminUserResponse toResponse(User user) {
//        AdminUserResponse r = new AdminUserResponse();
//        r.setId(user.getId());
//        r.setFullName(user.getFullName());
//        r.setEmail(user.getEmail());
//        r.setPhone(user.getPhone());
//        r.setRole(user.getRole());
//        r.setEnabled(user.isEnabled());
//        r.setCreatedAt(user.getCreatedAt());
//        accountRepository.findByUserId(user.getId())
//                .stream().findFirst().ifPresent(acc -> {
//                    r.setBalance(acc.getBalance());
//                    r.setAccountNumber(acc.getAccountNumber());
//                });
//        return r;
//    }
//}