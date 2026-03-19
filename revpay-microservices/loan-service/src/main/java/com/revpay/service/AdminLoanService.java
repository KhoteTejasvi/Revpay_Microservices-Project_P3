package com.revpay.service;

import com.revpay.client.NotificationServiceClient;
import com.revpay.client.UserServiceClient;
import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.loan.LoanResponse;
import com.revpay.dto.wallet.InternalCreditRequest;
import com.revpay.entity.EMI;
import com.revpay.entity.Loan;
import com.revpay.enums.EMIStatus;
import com.revpay.enums.LoanStatus;
import com.revpay.repository.EMIRepository;
import com.revpay.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLoanService {

    private final LoanRepository loanRepository;
    private final EMIRepository emiRepository;
    private final WalletServiceClient walletServiceClient;
    private final UserServiceClient userServiceClient;
    private final LoanService loanService;
    private final NotificationServiceClient notificationServiceClient;


    public Page<LoanResponse> getAllLoans(String status, Pageable pageable) {
        if (status != null && !status.equals("ALL")) {
            return loanRepository.findByStatus(LoanStatus.valueOf(status), pageable)
                    .map(loan -> loanService.toResponse(loan,
                            emiRepository.findByLoanId(loan.getId())));
        }
        return loanRepository.findAll(pageable)
                .map(loan -> loanService.toResponse(loan,
                        emiRepository.findByLoanId(loan.getId())));
    }

    @Transactional
    public LoanResponse approveLoan(Long loanId) {
        Loan loan = getLoan(loanId);

        if (loan.getStatus() != LoanStatus.APPLIED) {
            throw RevPayException.badRequest("Only APPLIED loans can be approved");
        }

        // Credit borrower wallet via wallet-service
        InternalCreditRequest creditReq = new InternalCreditRequest();
        creditReq.setEmail(loan.getBorrowerEmail());
        creditReq.setAmount(loan.getPrincipalAmount());
        creditReq.setDescription("Loan disbursement: " + loan.getLoanNumber());
        creditReq.setTransactionType("LOAN_DISBURSEMENT");
        walletServiceClient.credit(creditReq);

        // Generate EMI schedule
        generateEmiSchedule(loan);

        loan.setStatus(LoanStatus.ACTIVE);
        loan.setDisbursementDate(LocalDate.now());
        loanRepository.save(loan);

        // Notify borrower
        try {
            notificationServiceClient.createNotification(
                    new com.revpay.dto.notification.CreateNotificationRequest(
                            loan.getBorrowerEmail(),
                            "LOAN_STATUS_UPDATE",
                            "Loan Approved",
                            "Your loan " + loan.getLoanNumber() + " of $"
                                    + loan.getPrincipalAmount() + " has been approved!",
                            "/loans/" + loan.getId(),
                            loan.getId()
                    ));
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }

        return loanService.toResponse(loan, emiRepository.findByLoanId(loanId));
    }

    @Transactional
    public LoanResponse rejectLoan(Long loanId, String reason) {
        Loan loan = getLoan(loanId);

        if (loan.getStatus() != LoanStatus.APPLIED) {
            throw RevPayException.badRequest("Only APPLIED loans can be rejected");
        }

        loan.setStatus(LoanStatus.REJECTED);
        loan.setPurpose((loan.getPurpose() != null ? loan.getPurpose() : "")
                + " | Rejected: " + reason);

        try {
            notificationServiceClient.createNotification(
                    new com.revpay.dto.notification.CreateNotificationRequest(
                            loan.getBorrowerEmail(),
                            "LOAN_STATUS_UPDATE",
                            "Loan Rejected",
                            "Your loan application " + loan.getLoanNumber() + " was not approved.",
                            "/loans/" + loan.getId(),
                            loan.getId()
                    ));
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
        return loanService.toResponse(loanRepository.save(loan), List.of());
    }

    public long getPendingLoansCount() {
        return loanRepository.countByStatus(LoanStatus.APPLIED);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Loan getLoan(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Loan not found"));
    }

    private void generateEmiSchedule(Loan loan) {
        emiRepository.deleteByLoanId(loan.getId());

        BigDecimal principal   = loan.getPrincipalAmount();
        BigDecimal monthlyRate = loan.getInterestRate()
                .divide(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);
        int months = loan.getTenureMonths();
        LocalDate dueDate = LocalDate.now().plusMonths(1);

        for (int i = 1; i <= months; i++) {
            BigDecimal interestComponent = principal.multiply(monthlyRate)
                    .setScale(4, RoundingMode.HALF_UP);
            BigDecimal principalComponent = loan.getMonthlyEmiAmount()
                    .subtract(interestComponent)
                    .setScale(4, RoundingMode.HALF_UP);

            EMI emi = new EMI();
            emi.setLoan(loan);
            emi.setInstalmentNumber(i);
            emi.setAmount(loan.getMonthlyEmiAmount());
            emi.setPrincipalComponent(principalComponent);
            emi.setInterestComponent(interestComponent);
            emi.setDueDate(dueDate);
            emi.setStatus(EMIStatus.PENDING);
            emiRepository.save(emi);

            principal = principal.subtract(principalComponent);
            dueDate   = dueDate.plusMonths(1);
        }
    }
}