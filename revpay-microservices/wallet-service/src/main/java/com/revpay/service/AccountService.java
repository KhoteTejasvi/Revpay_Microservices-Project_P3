package com.revpay.service;

import com.revpay.client.UserServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.account.AccountResponse;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.entity.Account;
import com.revpay.enums.AccountType;
import com.revpay.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public List<AccountResponse> getMyAccounts(String email) {
        List<Account> accounts = accountRepository.findByUserEmail(email);

        // Auto-create wallet account on first access (syncs accountNumber from user-service)
        if (accounts.isEmpty()) {
            log.info("No wallet account for {} — creating from user-service data", email);
            accounts = List.of(createFromUserService(email));
        }

        return accounts.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccount(Long id, String email) {
        Account account = accountRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> RevPayException.notFound("Account not found"));
        return toResponse(account);
    }

    // Called internally by TransactionService / PaymentMethodService
    @Transactional
    public Account getPrimaryAccount(String email) {
        List<Account> accounts = accountRepository.findByUserEmail(email);
        if (accounts.isEmpty()) {
            return createFromUserService(email);
        }
        return accounts.get(0);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private Account createFromUserService(String email) {
        UserAccountInfo info = userServiceClient.getAccountInfo(email);

        Account account = Account.builder()
                .accountNumber(info.getAccountNumber())
                .accountType(AccountType.valueOf(info.getAccountType()))
                .userEmail(email)
                .build();

        return accountRepository.save(account);
    }

    public AccountResponse toResponse(Account account) {
        AccountResponse r = new AccountResponse();
        r.setId(account.getId());
        r.setAccountNumber(account.getAccountNumber());
        r.setAccountType(account.getAccountType());
        r.setStatus(account.getStatus());
        r.setBalance(account.getBalance());
        r.setCurrency(account.getCurrency());
        r.setCreatedAt(account.getCreatedAt());
        return r;
    }
}