package com.revpay.repository;

import com.revpay.entity.Invoice;
import com.revpay.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByIssuerEmail(String issuerEmail, Pageable pageable);
    Page<Invoice> findByRecipientEmail(String recipientEmail, Pageable pageable);
    long countByIssuerEmailAndStatus(String issuerEmail, InvoiceStatus status);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}