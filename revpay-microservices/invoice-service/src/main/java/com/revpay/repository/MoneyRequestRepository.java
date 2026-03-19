package com.revpay.repository;

import com.revpay.entity.MoneyRequest;
import com.revpay.enums.MoneyRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoneyRequestRepository extends JpaRepository<MoneyRequest, Long> {
    Page<MoneyRequest> findByRequesterEmail(String email, Pageable pageable);
    Page<MoneyRequest> findByPayerEmail(String email, Pageable pageable);
    List<MoneyRequest> findByPayerEmailAndStatus(String email, MoneyRequestStatus status);
    long countByPayerEmailAndStatus(String email, MoneyRequestStatus status);
}