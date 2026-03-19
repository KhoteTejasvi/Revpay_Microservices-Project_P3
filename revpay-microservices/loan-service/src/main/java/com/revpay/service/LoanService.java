package com.revpay.service;

import com.revpay.client.UserServiceClient;
import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.emi.EMIResponse;
import com.revpay.dto.loan.ApplyLoanRequest;
import com.revpay.dto.loan.LoanResponse;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.dto.wallet.InternalDebitRequest;
import com.revpay.entity.EMI;
import com.revpay.entity.Loan;
import com.revpay.enums.EMIStatus;
import com.revpay.enums.LoanStatus;
import com.revpay.repository.EMIRepository;
import com.revpay.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {

    private static final BigDecimal ANNUAL_RATE = new BigDecimal("12.00");

    private final LoanRepository loanRepository;
    private final EMIRepository emiRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;

    // ── Apply ────────────────────────────────────────────────

    @Transactional
    public LoanResponse applyForLoan(String email, ApplyLoanRequest req) {
        UserAccountInfo info = userServiceClient.getAccountInfo(email);

        BigDecimal monthlyRate = ANNUAL_RATE
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        int n = req.getTenureMonths();

        BigDecimal factor = monthlyRate.add(BigDecimal.ONE).pow(n);
        BigDecimal emi = req.getPrincipalAmount()
                .multiply(monthlyRate).multiply(factor)
                .divide(factor.subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);

        BigDecimal total = emi.multiply(BigDecimal.valueOf(n));

        Loan loan = new Loan();
        loan.setBorrowerEmail(email);
        loan.setBorrowerName(info.getFullName());
        loan.setLoanNumber("LN-" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 10).toUpperCase());
        loan.setStatus(LoanStatus.APPLIED);
        loan.setPrincipalAmount(req.getPrincipalAmount());
        loan.setInterestRate(ANNUAL_RATE);
        loan.setTenureMonths(n);
        loan.setMonthlyEmiAmount(emi);
        loan.setTotalRepayableAmount(total);
        loan.setAmountRepaid(BigDecimal.ZERO);
        loan.setPurpose(req.getPurpose());

        return toResponse(loanRepository.save(loan), List.of());
    }

    // ── Repay EMI ────────────────────────────────────────────

    @Transactional
    public LoanResponse repayEmi(String email, Long loanId, Long emiId) {
        Loan loan = getLoan(loanId);

        if (!loan.getBorrowerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        if (loan.getStatus() != LoanStatus.ACTIVE &&
                loan.getStatus() != LoanStatus.DISBURSED) {
            throw RevPayException.badRequest("Loan is not active");
        }

        EMI emi = emiRepository.findById(emiId)
                .orElseThrow(() -> RevPayException.notFound("EMI not found"));

        if (!emi.getLoan().getId().equals(loanId)) {
            throw RevPayException.badRequest("EMI does not belong to this loan");
        }
        if (emi.getStatus() == EMIStatus.PAID) {
            throw RevPayException.badRequest("EMI already paid");
        }

        // Debit via wallet-service
        InternalDebitRequest debitReq = new InternalDebitRequest();
        debitReq.setEmail(email);
        debitReq.setAmount(emi.getAmount());
        debitReq.setDescription("EMI payment for loan " + loan.getLoanNumber());
        debitReq.setTransactionType("EMI_PAYMENT");
        var tx = walletServiceClient.debit(debitReq);

        emi.setStatus(EMIStatus.PAID);
        emi.setPaidDate(java.time.LocalDate.now());
        emi.setTxReferenceNumber(tx.getReferenceNumber());
        emiRepository.save(emi);

        loan.setAmountRepaid(loan.getAmountRepaid().add(emi.getAmount()));

        long unpaid = emiRepository.countByLoanIdAndStatus(loanId, EMIStatus.SCHEDULED);
        if (unpaid == 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loan.setClosureDate(java.time.LocalDate.now());
        }
        loanRepository.save(loan);

        return toResponse(loan, emiRepository.findByLoanId(loanId));
    }

    // ── List ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<LoanResponse> getMyLoans(String email, Pageable pageable) {
        return loanRepository.findByBorrowerEmail(email, pageable)
                .map(loan -> toResponse(loan, emiRepository.findByLoanId(loan.getId())));
    }

    @Transactional(readOnly = true)
    public LoanResponse getLoanById(String email, Long id) {
        Loan loan = getLoan(id);
        if (!loan.getBorrowerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        return toResponse(loan, emiRepository.findByLoanId(id));
    }

    // ── Helper ───────────────────────────────────────────────

    private Loan getLoan(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Loan not found"));
    }

    public LoanResponse toResponse(Loan loan, List<EMI> emis) {
        LoanResponse r = new LoanResponse();
        r.setId(loan.getId());
        r.setLoanNumber(loan.getLoanNumber());
        r.setBorrowerName(loan.getBorrowerName());
        r.setBorrowerEmail(loan.getBorrowerEmail());
        r.setStatus(loan.getStatus());
        r.setPrincipalAmount(loan.getPrincipalAmount());
        r.setInterestRate(loan.getInterestRate());
        r.setTenureMonths(loan.getTenureMonths());
        r.setMonthlyEmiAmount(loan.getMonthlyEmiAmount());
        r.setTotalRepayableAmount(loan.getTotalRepayableAmount());
        r.setAmountRepaid(loan.getAmountRepaid());
        r.setPurpose(loan.getPurpose());
        r.setDisbursementDate(loan.getDisbursementDate());
        r.setClosureDate(loan.getClosureDate());
        r.setCreatedAt(loan.getCreatedAt());
        r.setAutoDebit(loan.isAutoDebit());
        r.setEmis(emis.stream().map(emi -> {
            EMIResponse er = new EMIResponse();
            er.setId(emi.getId());
            er.setInstalmentNumber(emi.getInstalmentNumber());
            er.setAmount(emi.getAmount());
            er.setPrincipalComponent(emi.getPrincipalComponent());
            er.setInterestComponent(emi.getInterestComponent());
            er.setFineAmount(emi.getFineAmount());
            er.setDueDate(emi.getDueDate());
            er.setPaidDate(emi.getPaidDate());
            er.setStatus(emi.getStatus());
            er.setTotalDue(emi.getFineAmount() != null
                    ? emi.getAmount().add(emi.getFineAmount())
                    : emi.getAmount());
            return er;
        }).toList());
        return r;
    }
}