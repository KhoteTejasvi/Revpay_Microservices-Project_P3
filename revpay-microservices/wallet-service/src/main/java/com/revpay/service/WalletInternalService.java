package com.revpay.service;

import com.revpay.client.NotificationServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.notification.CreateNotificationRequest;
import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.wallet.InternalCreditRequest;
import com.revpay.dto.wallet.InternalDebitRequest;
import com.revpay.dto.wallet.InternalTransferRequest;
import com.revpay.entity.Account;
import com.revpay.entity.Transaction;
import com.revpay.enums.AccountStatus;
import com.revpay.enums.TransactionStatus;
import com.revpay.enums.TransactionType;
import com.revpay.repository.AccountRepository;
import com.revpay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletInternalService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final NotificationServiceClient notificationServiceClient;

    @Transactional
    public TransactionResponse transfer(InternalTransferRequest req) {
        Account sender   = accountService.getPrimaryAccount(req.getSenderEmail());
        Account receiver = accountService.getPrimaryAccount(req.getReceiverEmail());

        if (sender.getStatus() != AccountStatus.ACTIVE) {
            throw RevPayException.badRequest("Sender account is not active");
        }
        if (sender.getBalance().compareTo(req.getAmount()) < 0) {
            throw RevPayException.badRequest("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(req.getAmount()));
        receiver.setBalance(receiver.getBalance().add(req.getAmount()));
        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
                TransactionType.valueOf(req.getTransactionType()));
        tx.setSenderAccount(sender);
        tx.setReceiverAccount(receiver);
        Transaction saved = transactionRepository.save(tx);

        // Notify both parties
        sendNotification(req.getSenderEmail(), "TRANSACTION_ALERT",
                "Money Sent",
                "You sent $" + req.getAmount() + " to " + req.getReceiverEmail(),
                "/transactions/" + saved.getId(), saved.getId());

        sendNotification(req.getReceiverEmail(), "TRANSACTION_ALERT",
                "Money Received",
                "You received $" + req.getAmount() + " from " + req.getSenderEmail(),
                "/transactions/" + saved.getId(), saved.getId());

        return toResponse(saved, sender);
    }

    @Transactional
    public TransactionResponse credit(InternalCreditRequest req) {
        Account account = accountService.getPrimaryAccount(req.getEmail());
        account.setBalance(account.getBalance().add(req.getAmount()));
        accountRepository.save(account);

        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
                TransactionType.valueOf(req.getTransactionType()));
        tx.setSenderAccount(null);
        tx.setReceiverAccount(account);
        Transaction saved = transactionRepository.save(tx);

        sendNotification(req.getEmail(), "TRANSACTION_ALERT",
                "Account Credited",
                "Your account has been credited with $" + req.getAmount(),
                "/transactions/" + saved.getId(), saved.getId());

        return toResponse(saved, account);
    }

    @Transactional
    public TransactionResponse debit(InternalDebitRequest req) {
        Account account = accountService.getPrimaryAccount(req.getEmail());

        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw RevPayException.badRequest("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(req.getAmount()));
        accountRepository.save(account);

        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
                TransactionType.valueOf(req.getTransactionType()));
        tx.setSenderAccount(account);
        tx.setReceiverAccount(null);
        Transaction saved = transactionRepository.save(tx);

        // Low balance alert
        if (account.getBalance().compareTo(new BigDecimal("100")) < 0) {
            sendNotification(req.getEmail(), "ACCOUNT_ALERT",
                    "Low Balance",
                    "Your balance is low: $" + account.getBalance(),
                    "/accounts", null);
        }

        sendNotification(req.getEmail(), "TRANSACTION_ALERT",
                "Payment Processed",
                "Payment of $" + req.getAmount() + " processed. " + req.getDescription(),
                "/transactions/" + saved.getId(), saved.getId());

        return toResponse(saved, account);
    }

    public Account getAccountByEmail(String email) {
        return accountService.getPrimaryAccount(email);
    }

    // ── Helpers ──────────────────────────────────────────────

    private void sendNotification(String email, String type,
                                  String title, String body,
                                  String actionUrl, Long referenceId) {
        try {
            notificationServiceClient.createNotification(
                    new CreateNotificationRequest(
                            email, type, title, body, actionUrl, referenceId));
        } catch (Exception e) {
            // Never fail the main transaction if notification fails
            log.warn("Failed to send notification to {}: {}", email, e.getMessage());
        }
    }

    private Transaction buildTx(BigDecimal amount, String description,
                                TransactionType type) {
        Transaction tx = new Transaction();
        tx.setReferenceNumber("TXN" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 12).toUpperCase());
        tx.setAmount(amount);
        tx.setFee(BigDecimal.ZERO);
        tx.setCurrency("USD");
        tx.setType(type);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setCompletedAt(Instant.now());
        tx.setDescription(description);
        return tx;
    }

    private TransactionResponse toResponse(Transaction tx, Account viewer) {
        TransactionResponse r = new TransactionResponse();
        r.setId(tx.getId());
        r.setReferenceNumber(tx.getReferenceNumber());
        r.setType(tx.getType());
        r.setStatus(tx.getStatus());
        r.setAmount(tx.getAmount());
        r.setFee(tx.getFee());
        r.setCurrency(tx.getCurrency());
        r.setDescription(tx.getDescription());
        r.setCreatedAt(tx.getCreatedAt());
        r.setCompletedAt(tx.getCompletedAt());
        r.setSenderAccountNumber(tx.getSenderAccount() != null
                ? tx.getSenderAccount().getAccountNumber() : "SYSTEM");
        r.setReceiverAccountNumber(tx.getReceiverAccount() != null
                ? tx.getReceiverAccount().getAccountNumber() : "SYSTEM");
        r.setCredit(tx.getReceiverAccount() != null
                && tx.getReceiverAccount().getId().equals(viewer.getId()));
        return r;
    }
}

//package com.revpay.service;
//
//import com.revpay.common.RevPayException;
//import com.revpay.dto.transaction.TransactionResponse;
//import com.revpay.dto.wallet.InternalCreditRequest;
//import com.revpay.dto.wallet.InternalDebitRequest;
//import com.revpay.dto.wallet.InternalTransferRequest;
//import com.revpay.entity.Account;
//import com.revpay.entity.Transaction;
//import com.revpay.enums.AccountStatus;
//import com.revpay.enums.TransactionStatus;
//import com.revpay.enums.TransactionType;
//import com.revpay.repository.AccountRepository;
//import com.revpay.repository.TransactionRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.Instant;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class WalletInternalService {
//
//    private final AccountRepository accountRepository;
//    private final TransactionRepository transactionRepository;
//    private final AccountService accountService;
//
//    @Transactional
//    public TransactionResponse transfer(InternalTransferRequest req) {
//        Account sender   = accountService.getPrimaryAccount(req.getSenderEmail());
//        Account receiver = accountService.getPrimaryAccount(req.getReceiverEmail());
//
//        if (sender.getStatus() != AccountStatus.ACTIVE) {
//            throw RevPayException.badRequest("Sender account is not active");
//        }
//        if (sender.getBalance().compareTo(req.getAmount()) < 0) {
//            throw RevPayException.badRequest("Insufficient balance");
//        }
//
//        sender.setBalance(sender.getBalance().subtract(req.getAmount()));
//        receiver.setBalance(receiver.getBalance().add(req.getAmount()));
//        accountRepository.save(sender);
//        accountRepository.save(receiver);
//
//        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
//                TransactionType.valueOf(req.getTransactionType()));
//        tx.setSenderAccount(sender);
//        tx.setReceiverAccount(receiver);
//        return toResponse(transactionRepository.save(tx), sender);
//    }
//
//    @Transactional
//    public TransactionResponse credit(InternalCreditRequest req) {
//        Account account = accountService.getPrimaryAccount(req.getEmail());
//        account.setBalance(account.getBalance().add(req.getAmount()));
//        accountRepository.save(account);
//
//        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
//                TransactionType.valueOf(req.getTransactionType()));
//        tx.setSenderAccount(null);
//        tx.setReceiverAccount(account);
//        return toResponse(transactionRepository.save(tx), account);
//    }
//
//    @Transactional
//    public TransactionResponse debit(InternalDebitRequest req) {
//        Account account = accountService.getPrimaryAccount(req.getEmail());
//
//        if (account.getBalance().compareTo(req.getAmount()) < 0) {
//            throw RevPayException.badRequest("Insufficient balance");
//        }
//        account.setBalance(account.getBalance().subtract(req.getAmount()));
//        accountRepository.save(account);
//
//        Transaction tx = buildTx(req.getAmount(), req.getDescription(),
//                TransactionType.valueOf(req.getTransactionType()));
//        tx.setSenderAccount(account);
//        tx.setReceiverAccount(null);
//        return toResponse(transactionRepository.save(tx), account);
//    }
//
//    // ── Helpers ──────────────────────────────────────────────
//
//    private Transaction buildTx(BigDecimal amount, String description,
//                                TransactionType type) {
//        Transaction tx = new Transaction();
//        tx.setReferenceNumber("TXN" + UUID.randomUUID().toString()
//                .replace("-", "").substring(0, 12).toUpperCase());
//        tx.setAmount(amount);
//        tx.setFee(BigDecimal.ZERO);
//        tx.setCurrency("USD");
//        tx.setType(type);
//        tx.setStatus(TransactionStatus.COMPLETED);
//        tx.setCompletedAt(Instant.now());
//        tx.setDescription(description);
//        return tx;
//    }
//
//    private TransactionResponse toResponse(Transaction tx, Account viewer) {
//        TransactionResponse r = new TransactionResponse();
//        r.setId(tx.getId());
//        r.setReferenceNumber(tx.getReferenceNumber());
//        r.setType(tx.getType());
//        r.setStatus(tx.getStatus());
//        r.setAmount(tx.getAmount());
//        r.setFee(tx.getFee());
//        r.setCurrency(tx.getCurrency());
//        r.setDescription(tx.getDescription());
//        r.setCreatedAt(tx.getCreatedAt());
//        r.setCompletedAt(tx.getCompletedAt());
//        r.setSenderAccountNumber(tx.getSenderAccount() != null
//                ? tx.getSenderAccount().getAccountNumber() : "SYSTEM");
//        r.setReceiverAccountNumber(tx.getReceiverAccount() != null
//                ? tx.getReceiverAccount().getAccountNumber() : "SYSTEM");
//        r.setCredit(tx.getReceiverAccount() != null
//                && tx.getReceiverAccount().getId().equals(viewer.getId()));
//        return r;
//    }
//    public Account getAccountByEmail(String email) {
//        return accountService.getPrimaryAccount(email);
//    }
//}