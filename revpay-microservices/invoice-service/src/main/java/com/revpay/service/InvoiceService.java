package com.revpay.service;

import com.revpay.client.NotificationServiceClient;
import com.revpay.client.UserServiceClient;
import com.revpay.client.WalletServiceClient;
import com.revpay.common.RevPayException;
import com.revpay.dto.invoice.*;
import com.revpay.dto.user.UserAccountInfo;
import com.revpay.dto.wallet.InternalTransferRequest;
import com.revpay.entity.Invoice;
import com.revpay.entity.InvoiceItem;
import com.revpay.enums.InvoiceStatus;
import com.revpay.repository.InvoiceItemRepository;
import com.revpay.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Transactional
    public InvoiceResponse createInvoice(String email, CreateInvoiceRequest req) {
        // Validate users exist via Feign
        userServiceClient.getAccountInfo(email);
        UserAccountInfo recipient = userServiceClient.getAccountInfo(req.getRecipientEmail());

        if (email.equalsIgnoreCase(req.getRecipientEmail())) {
            throw RevPayException.badRequest("Cannot create invoice for yourself");
        }

        BigDecimal subtotal = req.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRate    = req.getTaxRate() != null ? req.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount  = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100));
        BigDecimal total      = subtotal.add(taxAmount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 10).toUpperCase());
        invoice.setIssuerEmail(email);
        invoice.setRecipientEmail(req.getRecipientEmail());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setSubtotal(subtotal);
        invoice.setTaxRate(taxRate);
        invoice.setTotalAmount(total);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        invoice.setIssueDate(req.getIssueDate());
        invoice.setDueDate(req.getDueDate());
        invoice.setNotes(req.getNotes());

        Invoice saved = invoiceRepository.save(invoice);

        List<InvoiceItem> items = req.getItems().stream().map(itemReq -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(saved);
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setLineTotal(itemReq.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            return item;
        }).toList();

        invoiceItemRepository.saveAll(items);
        saved.setItems(items);

        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponse sendInvoice(String email, Long invoiceId) {
        Invoice invoice = getAndValidateOwner(email, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw RevPayException.badRequest("Only DRAFT invoices can be sent");
        }
        invoice.setStatus(InvoiceStatus.SENT);

        try {
            notificationServiceClient.createNotification(
                    new com.revpay.dto.notification.CreateNotificationRequest(
                            invoice.getRecipientEmail(),
                            "INVOICE_RECEIVED",
                            "New Invoice Received",
                            "You have received invoice " + invoice.getInvoiceNumber()
                                    + " for $" + invoice.getTotalAmount(),
                            "/invoices/" + invoice.getId(),
                            invoice.getId()
                    ));
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse payInvoice(String email, Long invoiceId) {
        Invoice invoice = getInvoice(invoiceId);

        if (!invoice.getRecipientEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized to pay this invoice");
        }
        if (invoice.getStatus() != InvoiceStatus.SENT) {
            throw RevPayException.badRequest("Invoice is not payable");
        }

        BigDecimal remaining = invoice.getTotalAmount().subtract(invoice.getAmountPaid());

        // Call wallet-service to do the actual transfer
        InternalTransferRequest transferReq = new InternalTransferRequest();
        transferReq.setSenderEmail(email);
        transferReq.setReceiverEmail(invoice.getIssuerEmail());
        transferReq.setAmount(remaining);
        transferReq.setDescription("Payment for invoice " + invoice.getInvoiceNumber());
        transferReq.setTransactionType("INVOICE_PAYMENT");
        walletServiceClient.transfer(transferReq);

        invoice.setAmountPaid(invoice.getTotalAmount());
        invoice.setStatus(InvoiceStatus.PAID);

        try {
            notificationServiceClient.createNotification(
                    new com.revpay.dto.notification.CreateNotificationRequest(
                            invoice.getIssuerEmail(),
                            "INVOICE_PAID",
                            "Invoice Paid",
                            "Invoice " + invoice.getInvoiceNumber()
                                    + " has been paid — $" + invoice.getTotalAmount(),
                            "/invoices/" + invoice.getId(),
                            invoice.getId()
                    ));
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse disputeInvoice(String email, Long invoiceId, String reason) {
        Invoice invoice = getInvoice(invoiceId);
        if (!invoice.getRecipientEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        if (invoice.getStatus() != InvoiceStatus.SENT) {
            throw RevPayException.badRequest("Only SENT invoices can be disputed");
        }
        invoice.setStatus(InvoiceStatus.DISPUTED);
        invoice.setDisputeReason(reason);
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse cancelInvoice(String email, Long invoiceId) {
        Invoice invoice = getAndValidateOwner(email, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw RevPayException.badRequest("Only DRAFT invoices can be cancelled");
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getMyInvoices(String email, Pageable pageable) {
        return invoiceRepository.findByIssuerEmail(email, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getReceivedInvoices(String email, Pageable pageable) {
        return invoiceRepository.findByRecipientEmail(email, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(String email, Long id) {
        return toResponse(getInvoice(id));
    }

    // ── Helpers ──────────────────────────────────────────────

    private Invoice getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Invoice not found"));
    }

    private Invoice getAndValidateOwner(String email, Long id) {
        Invoice invoice = getInvoice(id);
        if (!invoice.getIssuerEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        return invoice;
    }

    public InvoiceResponse toResponse(Invoice inv) {
        // Get user info from user-service for names
        String issuerName = "";
        String recipientName = "";
        Long issuerId = null;
        Long recipientId = null;
        try {
            UserAccountInfo issuerInfo = userServiceClient.getAccountInfo(inv.getIssuerEmail());
            issuerName = issuerInfo.getFullName();
            UserAccountInfo recipientInfo = userServiceClient.getAccountInfo(inv.getRecipientEmail());
            recipientName = recipientInfo.getFullName();
        } catch (Exception ignored) {}

        InvoiceResponse r = new InvoiceResponse();
        r.setId(inv.getId());
        r.setInvoiceNumber(inv.getInvoiceNumber());
        r.setStatus(inv.getStatus());
        r.setSubtotal(inv.getSubtotal());
        r.setTaxRate(inv.getTaxRate());
        r.setTotalAmount(inv.getTotalAmount());
        r.setAmountPaid(inv.getAmountPaid());
        r.setCurrency(inv.getCurrency());
        r.setIssueDate(inv.getIssueDate());
        r.setDueDate(inv.getDueDate());
        r.setNotes(inv.getNotes());
        r.setIssuerEmail(inv.getIssuerEmail());
        r.setIssuerName(issuerName);
        r.setRecipientEmail(inv.getRecipientEmail());
        r.setRecipientName(recipientName);
        r.setCreatedAt(inv.getCreatedAt());
        r.setDisputeReason(inv.getDisputeReason());

        if (inv.getItems() != null) {
            r.setItems(inv.getItems().stream().map(item -> {
                InvoiceItemResponse ir = new InvoiceItemResponse();
                ir.setId(item.getId());
                ir.setDescription(item.getDescription());
                ir.setQuantity(item.getQuantity());
                ir.setUnitPrice(item.getUnitPrice());
                ir.setLineTotal(item.getLineTotal());
                return ir;
            }).toList());
        }
        return r;
    }
}