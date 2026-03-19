package com.revpay.repository;

import com.revpay.entity.EMI;
import com.revpay.enums.EMIStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EMIRepository extends JpaRepository<EMI, Long> {
    List<EMI> findByLoanId(Long loanId);
    List<EMI> findByLoanIdAndStatus(Long loanId, EMIStatus status);
    long countByLoanIdAndStatus(Long loanId, EMIStatus status);
    void deleteByLoanId(Long loanId);
    List<EMI> findByLoanIdOrderByInstalmentNumberAsc(Long loanId);

    @Query("""
        SELECT e FROM EMI e
        WHERE e.status = 'PENDING'
          AND e.dueDate <= :today
          AND e.loan.autoDebit = true
          AND e.loan.status = 'ACTIVE'
    """)
    List<EMI> findDueForAutoDebit(@Param("today") LocalDate today);

    @Query("""
        SELECT e FROM EMI e
        WHERE e.status = 'PENDING'
          AND e.dueDate < :today
          AND e.fineAmount IS NULL
    """)
    List<EMI> findOverdueWithoutFine(@Param("today") LocalDate today);

    @Query("""
        SELECT e FROM EMI e
        WHERE e.loan.id = :loanId
          AND e.status = 'PENDING'
        ORDER BY e.instalmentNumber ASC
    """)
    List<EMI> findPendingByLoanId(@Param("loanId") Long loanId);
}