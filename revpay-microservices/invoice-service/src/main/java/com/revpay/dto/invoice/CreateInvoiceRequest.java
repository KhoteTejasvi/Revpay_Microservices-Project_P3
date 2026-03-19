package com.revpay.dto.invoice;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreateInvoiceRequest {

    @NotBlank @Email
    private String recipientEmail;

    @NotNull
    private LocalDate issueDate;

    @NotNull
    private LocalDate dueDate;

    private BigDecimal taxRate = BigDecimal.ZERO;
    private String notes;
    private String currency = "USD";

    @NotNull @Size(min = 1)
    private List<InvoiceItemRequest> items;

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<InvoiceItemRequest> getItems() { return items; }
    public void setItems(List<InvoiceItemRequest> items) { this.items = items; }
}