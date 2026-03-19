package com.revpay.repository;

import com.revpay.entity.Account;
import com.revpay.entity.Transaction;
import com.revpay.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.senderAccount IS NOT NULL AND t.senderAccount.id = :accountId)
           OR (t.receiverAccount IS NOT NULL AND t.receiverAccount.id = :accountId)
        ORDER BY t.createdAt DESC
    """)
    Page<Transaction> findAllByAccountId(@Param("accountId") Long accountId, Pageable pageable);

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId)
          AND t.status = :status
        ORDER BY t.createdAt DESC
    """)
    Page<Transaction> findByAccountIdAndStatus(
            @Param("accountId") Long accountId,
            @Param("status") TransactionStatus status,
            Pageable pageable);

    Optional<Transaction> findByReferenceNumber(String referenceNumber);

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.senderAccount IS NOT NULL AND t.senderAccount = :sender)
           OR (t.receiverAccount IS NOT NULL AND t.receiverAccount = :receiver)
        ORDER BY t.createdAt DESC
    """)
    Page<Transaction> findBySenderAccountOrReceiverAccount(
            @Param("sender") Account sender,
            @Param("receiver") Account receiver,
            Pageable pageable);

    List<Transaction> findBySenderAccountOrReceiverAccountOrderByCreatedAtDesc(
            Account sender, Account receiver);

    long countBySenderAccountId(Long accountId);
}