package com.revpay.repository;

import com.revpay.entity.Account;
import com.revpay.entity.User;
import com.revpay.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserId(Long userId);
    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    List<Account> findByUser(User user);
    List<Account> findByUserIdAndStatus(Long userId, AccountStatus status);
}