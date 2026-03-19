package com.revpay.entity;

import com.revpay.enums.Role;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "phone")
        })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String phone;

    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private boolean phoneVerified = false;

    // In user-service, Account is the only owned relationship
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Account> accounts = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private Instant resetTokenExpiry;

    // ── No-args constructor (required by JPA) ──────────────────────────
    public User() {}

    public User(Long id, String fullName, String email, String password, String phone,
                String profilePictureUrl, Role role, boolean enabled,
                boolean emailVerified, boolean phoneVerified,
                List<Account> accounts,
                Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.profilePictureUrl = profilePictureUrl;
        this.role = role;
        this.enabled = enabled;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
        this.accounts = accounts != null ? accounts : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── Builder ─────────────────────────────────────────────────────────
    public static class Builder {
        private Long id;
        private String fullName;
        private String email;
        private String password;
        private String phone;
        private String profilePictureUrl;
        private Role role;
        private boolean enabled = true;
        private boolean emailVerified = false;
        private boolean phoneVerified = false;
        private List<Account> accounts = new ArrayList<>();
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(Long id)                   { this.id = id; return this; }
        public Builder fullName(String v)            { this.fullName = v; return this; }
        public Builder email(String v)               { this.email = v; return this; }
        public Builder password(String v)            { this.password = v; return this; }
        public Builder phone(String v)               { this.phone = v; return this; }
        public Builder profilePictureUrl(String v)   { this.profilePictureUrl = v; return this; }
        public Builder role(Role v)                  { this.role = v; return this; }
        public Builder enabled(boolean v)            { this.enabled = v; return this; }
        public Builder emailVerified(boolean v)      { this.emailVerified = v; return this; }
        public Builder phoneVerified(boolean v)      { this.phoneVerified = v; return this; }
        public Builder accounts(List<Account> v)     { this.accounts = v; return this; }

        public User build() {
            return new User(id, fullName, email, password, phone,
                    profilePictureUrl, role, enabled, emailVerified, phoneVerified,
                    accounts, createdAt, updatedAt);
        }
    }

    public static Builder builder() { return new Builder(); }

    // ── Getters & Setters ────────────────────────────────────────────────
    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }
    public String getFullName()                  { return fullName; }
    public void setFullName(String v)            { this.fullName = v; }
    public String getEmail()                     { return email; }
    public void setEmail(String v)               { this.email = v; }
    public String getPassword()                  { return password; }
    public void setPassword(String v)            { this.password = v; }
    public String getPhone()                     { return phone; }
    public void setPhone(String v)               { this.phone = v; }
    public String getProfilePictureUrl()         { return profilePictureUrl; }
    public void setProfilePictureUrl(String v)   { this.profilePictureUrl = v; }
    public Role getRole()                        { return role; }
    public void setRole(Role v)                  { this.role = v; }
    public boolean isEnabled()                   { return enabled; }
    public void setEnabled(boolean v)            { this.enabled = v; }
    public boolean isEmailVerified()             { return emailVerified; }
    public void setEmailVerified(boolean v)      { this.emailVerified = v; }
    public boolean isPhoneVerified()             { return phoneVerified; }
    public void setPhoneVerified(boolean v)      { this.phoneVerified = v; }
    public List<Account> getAccounts()           { return accounts; }
    public void setAccounts(List<Account> v)     { this.accounts = v; }
    public Instant getCreatedAt()                { return createdAt; }
    public Instant getUpdatedAt()                { return updatedAt; }
    public String getResetToken()                { return resetToken; }
    public void setResetToken(String v)          { this.resetToken = v; }
    public Instant getResetTokenExpiry()         { return resetTokenExpiry; }
    public void setResetTokenExpiry(Instant v)   { this.resetTokenExpiry = v; }
}