package com.revpay.dto.admin;

import com.revpay.enums.Role;

import java.math.BigDecimal;
import java.time.Instant;

public class AdminUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private boolean enabled;
    private Instant createdAt;
    private BigDecimal balance;
    private String accountNumber;

    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public String getFullName()                  { return fullName; }
    public void setFullName(String v)            { this.fullName = v; }

    public String getEmail()                     { return email; }
    public void setEmail(String v)               { this.email = v; }

    public String getPhone()                     { return phone; }
    public void setPhone(String v)               { this.phone = v; }

    public Role getRole()                        { return role; }
    public void setRole(Role v)                  { this.role = v; }

    public boolean isEnabled()                   { return enabled; }
    public void setEnabled(boolean v)            { this.enabled = v; }

    public Instant getCreatedAt()                { return createdAt; }
    public void setCreatedAt(Instant v)          { this.createdAt = v; }

    public BigDecimal getBalance()               { return balance; }
    public void setBalance(BigDecimal v)         { this.balance = v; }

    public String getAccountNumber()             { return accountNumber; }
    public void setAccountNumber(String v)       { this.accountNumber = v; }
}