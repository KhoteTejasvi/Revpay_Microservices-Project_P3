package com.revpay.dto.dashboard;

import com.revpay.dto.account.AccountResponse;
import com.revpay.dto.transaction.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {
    private String fullName;
    private String email;
    private String role;
    private AccountResponse primaryAccount;
    private BigDecimal totalBalance;
    private long totalTransactions;
    private long pendingMoneyRequests;
    private long activeLoans;
    private long pendingInvoices;
    private List<TransactionResponse> recentTransactions;

    public String getFullName()                        { return fullName; }
    public void setFullName(String v)                  { this.fullName = v; }
    public String getEmail()                           { return email; }
    public void setEmail(String v)                     { this.email = v; }
    public String getRole()                            { return role; }
    public void setRole(String v)                      { this.role = v; }
    public AccountResponse getPrimaryAccount()         { return primaryAccount; }
    public void setPrimaryAccount(AccountResponse v)   { this.primaryAccount = v; }
    public BigDecimal getTotalBalance()                { return totalBalance; }
    public void setTotalBalance(BigDecimal v)          { this.totalBalance = v; }
    public long getTotalTransactions()                 { return totalTransactions; }
    public void setTotalTransactions(long v)           { this.totalTransactions = v; }
    public long getPendingMoneyRequests()              { return pendingMoneyRequests; }
    public void setPendingMoneyRequests(long v)        { this.pendingMoneyRequests = v; }
    public long getActiveLoans()                       { return activeLoans; }
    public void setActiveLoans(long v)                 { this.activeLoans = v; }
    public long getPendingInvoices()                   { return pendingInvoices; }
    public void setPendingInvoices(long v)             { this.pendingInvoices = v; }
    public List<TransactionResponse> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionResponse> v) { this.recentTransactions = v; }
}