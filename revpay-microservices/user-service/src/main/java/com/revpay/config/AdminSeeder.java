package com.revpay.config;

import com.revpay.entity.Account;
import com.revpay.entity.User;
import com.revpay.enums.AccountStatus;
import com.revpay.enums.AccountType;
import com.revpay.enums.Role;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository,
                       AccountRepository accountRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@revpay.com")) {
            log.info("Admin user already exists — skipping seed");
            return;
        }

        String rawPassword = "Admin@123456";

        User admin = new User();
        admin.setFullName("RevPay Admin");
        admin.setEmail("admin@revpay.com");
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setEmailVerified(true);
        admin.setPhoneVerified(false);
        userRepository.save(admin);

        Account account = new Account();
        account.setUser(admin);
        account.setAccountNumber("REVADMIN0001");
        account.setAccountType(AccountType.WALLET);
        account.setStatus(AccountStatus.ACTIVE);
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency("USD");
        accountRepository.save(account);

        log.info("========================================");
        log.info("   ADMIN ACCOUNT CREATED");
        log.info("   Email    : admin@revpay.com");
        log.info("   Password : {}", rawPassword);
        log.info("========================================");
    }
}