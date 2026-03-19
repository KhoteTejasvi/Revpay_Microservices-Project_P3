package com.revpay.dto.user;

public class UserAccountInfo {
    private String email;
    private String fullName;
    private String role;
    private String accountNumber;
    private String accountType;

    public UserAccountInfo() {}

    public UserAccountInfo(String email, String fullName,String role,
                           String accountNumber, String accountType) {
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
    }

    public String getEmail()         { return email; }
    public void setEmail(String v)   { this.email = v; }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole()          { return role; }
    public void setRole(String v)    { this.role = v; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String v) { this.accountNumber = v; }
    public String getAccountType()   { return accountType; }
    public void setAccountType(String v)   { this.accountType = v; }
}