package com.revpay.service;

import com.revpay.common.RevPayException;
import com.revpay.dto.transaction.TopUpRequest;
import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.transaction.TransferRequest;
import com.revpay.entity.Account;
import com.revpay.entity.PaymentMethod;
import com.revpay.entity.Transaction;
import com.revpay.enums.AccountStatus;
import com.revpay.enums.TransactionStatus;
import com.revpay.enums.TransactionType;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.PaymentMethodRepository;
import com.revpay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final AccountService accountService;  // for auto-create logic

    // ── Transfer ─────────────────────────────────────────────

    @Transactional
    public TransactionResponse transfer(String email, TransferRequest req) {
        Account senderAccount = accountService.getPrimaryAccount(email);

        // Find receiver account by their email
        Account receiverAccount = accountRepository
                .findByUserEmail(req.getReceiverEmail())
                .stream().findFirst()
                .orElseThrow(() -> RevPayException.notFound(
                        "No wallet account found for: " + req.getReceiverEmail()));

        if (senderAccount.getUserEmail().equalsIgnoreCase(req.getReceiverEmail())) {
            throw RevPayException.badRequest("Cannot send money to yourself");
        }

        validateAccountActive(senderAccount);
        validateSufficientBalance(senderAccount, req.getAmount());

        senderAccount.setBalance(senderAccount.getBalance().subtract(req.getAmount()));
        receiverAccount.setBalance(receiverAccount.getBalance().add(req.getAmount()));

        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        Transaction tx = buildTransaction(
                senderAccount, receiverAccount,
                req.getAmount(), TransactionType.TRANSFER,
                req.getDescription(), req.getNote(), null
        );
        return toResponse(transactionRepository.save(tx));
    }

    // ── Top Up ───────────────────────────────────────────────

    @Transactional
    public TransactionResponse topUp(String email, TopUpRequest req) {
        Account account = accountService.getPrimaryAccount(email);

        PaymentMethod pm = paymentMethodRepository
                .findByIdAndUserEmail(req.getPaymentMethodId(), email)
                .orElseThrow(() -> RevPayException.notFound("Payment method not found"));

        validateAccountActive(account);

        account.setBalance(account.getBalance().add(req.getAmount()));
        accountRepository.save(account);

        Transaction tx = buildTransaction(
                account, account,
                req.getAmount(), TransactionType.DEPOSIT,
                req.getDescription() != null ? req.getDescription() : "Wallet top-up",
                null, pm
        );
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setCompletedAt(Instant.now());

        return toResponse(transactionRepository.save(tx));
    }

    // ── History ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getHistory(String email, Pageable pageable) {
        Account account = accountService.getPrimaryAccount(email);
        return transactionRepository
                .findAllByAccountId(account.getId(), pageable)
//                .map(this::toResponse);
                .map(tx -> toResponse(tx, account));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(String email, Pageable pageable) {
        Account account = accountService.getPrimaryAccount(email);
        return transactionRepository
                .findBySenderAccountOrReceiverAccount(account, account, pageable)
                .map(tx -> toResponse(tx, account));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsForExport(
            String email, String fromDate, String toDate) {

        Account account = accountService.getPrimaryAccount(email);
        List<Transaction> all = transactionRepository
                .findBySenderAccountOrReceiverAccountOrderByCreatedAtDesc(account, account);

        return all.stream()
                .filter(tx -> {
                    if (fromDate == null && toDate == null) return true;
                    Instant from = fromDate != null
                            ? LocalDate.parse(fromDate).atStartOfDay(ZoneOffset.UTC).toInstant()
                            : Instant.MIN;
                    Instant to = toDate != null
                            ? LocalDate.parse(toDate).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant()
                            : Instant.MAX;
                    Instant txTime = tx.getCreatedAt() != null ? tx.getCreatedAt() : Instant.MIN;
                    return txTime.isAfter(from) && txTime.isBefore(to);
                })
                .map(tx -> toResponse(tx, account))
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────

    private Transaction buildTransaction(Account sender, Account receiver,
                                         BigDecimal amount, TransactionType type,
                                         String description, String note,
                                         PaymentMethod pm) {
        Transaction tx = new Transaction();
        tx.setReferenceNumber("TXN" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 12).toUpperCase());
        tx.setSenderAccount(sender);
        tx.setReceiverAccount(receiver);
        tx.setAmount(amount);
        tx.setFee(BigDecimal.ZERO);
        tx.setCurrency("USD");
        tx.setType(type);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setCompletedAt(Instant.now());
        tx.setDescription(description);
        tx.setNote(note);
        tx.setPaymentMethod(pm);
        return tx;
    }

    private void validateAccountActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw RevPayException.badRequest("Account is not active");
        }
    }

    private void validateSufficientBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw RevPayException.badRequest("Insufficient balance");
        }
    }

    // ── Response mapping (identical to monolith) ─────────────

    public TransactionResponse toResponse(Transaction tx) {
        if (tx.getType() == TransactionType.DEPOSIT) {
            Account viewer = tx.getReceiverAccount() != null
                    ? tx.getReceiverAccount() : tx.getSenderAccount();
            return toResponse(tx, viewer);
        }
        Account viewer = tx.getSenderAccount() != null
                ? tx.getSenderAccount() : tx.getReceiverAccount();
        return toResponse(tx, viewer);
    }

    public TransactionResponse toResponse(Transaction tx, Account viewerAccount) {
        TransactionResponse r = new TransactionResponse();
        r.setId(tx.getId());
        r.setReferenceNumber(tx.getReferenceNumber());
        r.setType(tx.getType());
        r.setStatus(tx.getStatus());
        r.setAmount(tx.getAmount());
        r.setFee(tx.getFee());
        r.setCurrency(tx.getCurrency());
        r.setDescription(tx.getDescription());
        r.setNote(tx.getNote());
        r.setCreatedAt(tx.getCreatedAt());
        r.setCompletedAt(tx.getCompletedAt());

        if (tx.getType() == TransactionType.DEPOSIT) {
            r.setCredit(true);
            r.setSenderAccountNumber("EXTERNAL");
            r.setReceiverAccountNumber(tx.getReceiverAccount() != null
                    ? tx.getReceiverAccount().getAccountNumber() : "");

        } else if (tx.getSenderAccount() == null) {
            r.setCredit(true);
            r.setSenderAccountNumber("SYSTEM");
            r.setReceiverAccountNumber(tx.getReceiverAccount() != null
                    ? tx.getReceiverAccount().getAccountNumber() : "");

        } else if (tx.getReceiverAccount() != null
                && tx.getReceiverAccount().getId().equals(viewerAccount.getId())
                && !tx.getSenderAccount().getId().equals(viewerAccount.getId())) {
            r.setCredit(true);
            r.setSenderAccountNumber(tx.getSenderAccount().getAccountNumber());
            r.setReceiverAccountNumber(tx.getReceiverAccount().getAccountNumber());

        } else {
            r.setCredit(false);
            r.setSenderAccountNumber(tx.getSenderAccount().getAccountNumber());
            r.setReceiverAccountNumber(tx.getReceiverAccount() != null
                    ? tx.getReceiverAccount().getAccountNumber() : "SYSTEM");
        }

        return r;
    }
}