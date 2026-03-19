package com.revpay.service;

import com.revpay.client.InvoiceServiceClient;
import com.revpay.client.LoanServiceClient;
import com.revpay.client.MoneyRequestServiceClient;
import com.revpay.client.UserServiceClient;
import com.revpay.dto.dashboard.DashboardResponse;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.entity.Account;
import com.revpay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountService accountService;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final UserServiceClient userServiceClient;
    private final InvoiceServiceClient invoiceServiceClient;
    private final LoanServiceClient loanServiceClient;
    private final MoneyRequestServiceClient moneyRequestServiceClient;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {
        // Get user info from user-service
        UserAccountInfo userInfo = userServiceClient.getAccountInfo(email);

        // Get wallet account
        Account account = accountService.getPrimaryAccount(email);

        // Recent transactions
        Account viewerAccount = account;
        var recentTransactions = transactionRepository
                .findAllByAccountId(account.getId(), PageRequest.of(0, 5))
//                .map(transactionService::toResponse)
                .map(tx -> transactionService.toResponse(tx, viewerAccount))
                .toList();

        // Cross-service counts — fail gracefully if service is down
        long pendingMoneyRequests = safeCall(() ->
                moneyRequestServiceClient.getPendingMoneyRequestCount(email), 0L);

        long activeLoans = safeCall(() ->
                loanServiceClient.getActiveLoanCount(email), 0L);

        long pendingInvoices = safeCall(() ->
                invoiceServiceClient.getPendingInvoiceCount(email), 0L);

        DashboardResponse res = new DashboardResponse();
        res.setFullName(userInfo.getFullName());
        res.setEmail(email);
        res.setRole(userInfo.getRole());
        res.setPrimaryAccount(accountService.toResponse(account));
        res.setTotalBalance(account.getBalance());
        res.setTotalTransactions(
                transactionRepository.countBySenderAccountId(account.getId()));
        res.setPendingMoneyRequests(pendingMoneyRequests);
        res.setActiveLoans(activeLoans);
        res.setPendingInvoices(pendingInvoices);
        res.setRecentTransactions(recentTransactions);
        return res;
    }

    // Returns fallback if the downstream service is unavailable
    private <T> T safeCall(java.util.concurrent.Callable<T> call, T fallback) {
        try {
            return call.call();
        } catch (Exception e) {
            log.warn("Dashboard cross-service call failed: {}", e.getMessage());
            return fallback;
        }
    }
}