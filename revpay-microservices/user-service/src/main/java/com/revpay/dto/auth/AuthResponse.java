package com.revpay.dto.auth;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String role;
    private String email;
    private String fullName;
    private Long accountId;

    public String getToken()                    { return token; }
    public void setToken(String token)          { this.token = token; }
    public String getRefreshToken()             { return refreshToken; }
    public void setRefreshToken(String v)       { this.refreshToken = v; }
    public String getRole()                     { return role; }
    public void setRole(String role)            { this.role = role; }
    public String getEmail()                    { return email; }
    public void setEmail(String email)          { this.email = email; }
    public String getFullName()                 { return fullName; }
    public void setFullName(String fullName)    { this.fullName = fullName; }
    public Long getAccountId()                  { return accountId; }
    public void setAccountId(Long accountId)    { this.accountId = accountId; }
}