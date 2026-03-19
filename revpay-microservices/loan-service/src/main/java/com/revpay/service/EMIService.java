package com.revpay.service;

import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.emi.EMIResponse;
import com.revpay.dto.wallet.InternalDebitRequest;
import com.revpay.entity.EMI;
import com.revpay.entity.Loan;
import com.revpay.enums.EMIStatus;
import com.revpay.enums.LoanStatus;
import com.revpay.repository.EMIRepository;
import com.revpay.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EMIService {

    private final EMIRepository emiRepository;
    private final LoanRepository loanRepository;
    private final WalletServiceClient walletServiceClient;
    private final LoanService loanService;

    private static final BigDecimal FINE_RATE = new BigDecimal("0.02");

    // ── Get EMI schedule ─────────────────────────────────────

    public List<EMIResponse> getEmiSchedule(String email, Long loanId) {
        Loan loan = getLoan(loanId);
        if (!loan.getBorrowerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        return emiRepository.findByLoanIdOrderByInstalmentNumberAsc(loanId)
                .stream().map(this::toResponse).toList();
    }

    // ── Manual EMI payment ───────────────────────────────────

    @Transactional
    public EMIResponse payEmi(String email, Long emiId) {
        EMI emi = emiRepository.findById(emiId)
                .orElseThrow(() -> RevPayException.notFound("EMI not found"));

        if (!emi.getLoan().getBorrowerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        if (emi.getStatus() == EMIStatus.PAID) {
            throw RevPayException.badRequest("EMI already paid");
        }

        BigDecimal totalDue = emi.getAmount();
        if (emi.getFineAmount() != null) {
            totalDue = totalDue.add(emi.getFineAmount());
        }

        // Debit via wallet-service
        InternalDebitRequest debitReq = new InternalDebitRequest();
        debitReq.setEmail(email);
        debitReq.setAmount(totalDue);
        debitReq.setDescription("EMI payment #" + emi.getInstalmentNumber()
                + " — " + emi.getLoan().getLoanNumber());
        debitReq.setTransactionType("EMI_PAYMENT");
        var tx = walletServiceClient.debit(debitReq);

        // Update loan repaid amount
        Loan loan = emi.getLoan();
        loan.setAmountRepaid(loan.getAmountRepaid().add(emi.getAmount()));

        long remaining = emiRepository.findPendingByLoanId(loan.getId())
                .stream().filter(e -> !e.getId().equals(emiId)).count();
        if (remaining == 0) {
            loan.setStatus(LoanStatus.CLOSED);
        }
        loanRepository.save(loan);

        emi.setStatus(EMIStatus.PAID);
        emi.setPaidDate(LocalDate.now());
        emi.setTxReferenceNumber(tx.getReferenceNumber());
        emiRepository.save(emi);

        return toResponse(emi);
    }

    // ── Toggle auto-debit ────────────────────────────────────

    @Transactional
    public void toggleAutoDebit(String email, Long loanId) {
        Loan loan = getLoan(loanId);
        if (!loan.getBorrowerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        loan.setAutoDebit(!loan.isAutoDebit());
        loanRepository.save(loan);
    }

    // ── Schedulers ───────────────────────────────────────────

    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void imposeOverdueFines() {
        List<EMI> overdueEmis = emiRepository.findOverdueWithoutFine(LocalDate.now());
        for (EMI emi : overdueEmis) {
            BigDecimal fine = emi.getAmount()
                    .multiply(FINE_RATE)
                    .setScale(2, RoundingMode.HALF_UP);
            emi.setFineAmount(fine);
            emi.setStatus(EMIStatus.OVERDUE);
            emiRepository.save(emi);
        }
    }

    @Scheduled(cron = "0 30 9 * * *")
    @Transactional
    public void processAutoDebits() {
        List<EMI> dueEmis = emiRepository.findDueForAutoDebit(LocalDate.now());
        for (EMI emi : dueEmis) {
            try {
                payEmi(emi.getLoan().getBorrowerEmail(), emi.getId());
            } catch (Exception e) {
                System.err.println("Auto-debit failed for EMI "
                        + emi.getId() + ": " + e.getMessage());
            }
        }
    }

    // ── Helper ───────────────────────────────────────────────

    private Loan getLoan(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Loan not found"));
    }

    public EMIResponse toResponse(EMI emi) {
        EMIResponse r = new EMIResponse();
        r.setId(emi.getId());
        r.setInstalmentNumber(emi.getInstalmentNumber());
        r.setAmount(emi.getAmount());
        r.setPrincipalComponent(emi.getPrincipalComponent());
        r.setInterestComponent(emi.getInterestComponent());
        r.setFineAmount(emi.getFineAmount());
        r.setDueDate(emi.getDueDate());
        r.setPaidDate(emi.getPaidDate());
        r.setStatus(emi.getStatus());
        r.setTotalDue(emi.getFineAmount() != null
                ? emi.getAmount().add(emi.getFineAmount())
                : emi.getAmount());
        return r;
    }
}