package com.revpay.service;

import com.revpay.client.NotificationServiceClient;
import com.revpay.client.UserServiceClient;
import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.moneyrequest.MoneyRequestDto;
import com.revpay.dto.moneyrequest.MoneyRequestResponse;
import com.revpay.dto.notification.CreateNotificationRequest;
import com.revpay.dto.transaction.TransactionResponse;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.dto.wallet.InternalTransferRequest;
import com.revpay.entity.MoneyRequest;
import com.revpay.enums.MoneyRequestStatus;
import com.revpay.repository.MoneyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class MoneyRequestService {

    private final MoneyRequestRepository moneyRequestRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Transactional
    public MoneyRequestResponse sendRequest(String email, MoneyRequestDto dto) {
        userServiceClient.getAccountInfo(email);
        userServiceClient.getAccountInfo(dto.getPayerIdentifier());

        if (email.equalsIgnoreCase(dto.getPayerIdentifier())) {
            throw RevPayException.badRequest("Cannot request money from yourself");
        }

        MoneyRequest request = new MoneyRequest();
        request.setRequesterEmail(email);
        request.setPayerEmail(dto.getPayerIdentifier());
        request.setAmount(dto.getAmount());
        request.setCurrency("USD");
        request.setMessage(dto.getMessage());
        request.setStatus(MoneyRequestStatus.PENDING);
        request.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        MoneyRequest saved = moneyRequestRepository.save(request);

        // Notify the payer
        try {
            String requesterName = userServiceClient.getAccountInfo(email).getFullName();
            notificationServiceClient.createNotification(new CreateNotificationRequest(
                    dto.getPayerIdentifier(),
                    "MONEY_REQUEST",
                    "Money Request Received",
                    requesterName + " is requesting $" + dto.getAmount()
                            + (dto.getMessage() != null ? " — " + dto.getMessage() : ""),
                    "/request",
                    saved.getId()
            ));
        } catch (Exception e) { /* non-critical */ }

        return toResponse(saved);
    }

    @Transactional
    public MoneyRequestResponse acceptRequest(String email, Long requestId, String transactionPin) {
        // Validate PIN
        if (transactionPin == null || transactionPin.isBlank()) {
            throw RevPayException.badRequest("Transaction PIN is required");
        }
        try {
            userServiceClient.verifyPin(email, java.util.Map.of("pin", transactionPin));
        } catch (feign.FeignException.BadRequest e) {
            throw RevPayException.badRequest("Invalid transaction PIN");
        } catch (feign.FeignException.Forbidden e) {
            throw RevPayException.forbidden("Account locked due to too many wrong PIN attempts");
        }

        MoneyRequest request = getRequest(requestId);

        if (!request.getPayerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized to accept this request");
        }
        if (request.getStatus() != MoneyRequestStatus.PENDING) {
            throw RevPayException.badRequest("Request is no longer pending");
        }

        InternalTransferRequest transferReq = new InternalTransferRequest();
        transferReq.setSenderEmail(email);
        transferReq.setReceiverEmail(request.getRequesterEmail());
        transferReq.setAmount(request.getAmount());
        transferReq.setDescription("Money request fulfillment");
        transferReq.setTransactionType("MONEY_REQUEST_FULFILLMENT");
        TransactionResponse tx = walletServiceClient.transfer(transferReq);

        request.setStatus(MoneyRequestStatus.ACCEPTED);
        request.setTxReferenceNumber(tx.getReferenceNumber());
        return toResponse(moneyRequestRepository.save(request));
    }

    @Transactional
    public MoneyRequestResponse rejectRequest(String email, Long requestId) {
        MoneyRequest request = getRequest(requestId);

        if (!request.getPayerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized to reject this request");
        }
        if (request.getStatus() != MoneyRequestStatus.PENDING) {
            throw RevPayException.badRequest("Request is no longer pending");
        }

        request.setStatus(MoneyRequestStatus.REJECTED);
        return toResponse(moneyRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public Page<MoneyRequestResponse> getSentRequests(String email, Pageable pageable) {
        return moneyRequestRepository.findByRequesterEmail(email, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<MoneyRequestResponse> getReceivedRequests(String email, Pageable pageable) {
        return moneyRequestRepository.findByPayerEmail(email, pageable)
                .map(this::toResponse);
    }

    public long countPendingForPayer(String email) {
        return moneyRequestRepository.countByPayerEmailAndStatus(
                email, MoneyRequestStatus.PENDING);
    }

    private MoneyRequest getRequest(Long id) {
        return moneyRequestRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Money request not found"));
    }

    public MoneyRequestResponse toResponse(MoneyRequest r) {
        String requesterName = "";
        String payerName = "";
        try {
            requesterName = userServiceClient.getAccountInfo(r.getRequesterEmail()).getFullName();
            payerName     = userServiceClient.getAccountInfo(r.getPayerEmail()).getFullName();
        } catch (Exception ignored) {}

        MoneyRequestResponse res = new MoneyRequestResponse();
        res.setId(r.getId());
        res.setAmount(r.getAmount());
        res.setCurrency(r.getCurrency());
        res.setMessage(r.getMessage());
        res.setStatus(r.getStatus());
        res.setRequesterEmail(r.getRequesterEmail());
        res.setRequesterName(requesterName);
        res.setPayerEmail(r.getPayerEmail());
        res.setPayerName(payerName);
        res.setCreatedAt(r.getCreatedAt());
        res.setExpiresAt(r.getExpiresAt());
        return res;
    }
}
