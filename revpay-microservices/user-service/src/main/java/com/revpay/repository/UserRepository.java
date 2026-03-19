package com.revpay.repository;

import com.revpay.entity.User;
import com.revpay.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    long countByRole(Role role);
    Page<User> findByRoleNot(Role role, Pageable pageable);
    long countByRoleNot(Role role);
    Optional<User> findByResetToken(String token);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.accounts WHERE u.email = :email")
    Optional<User> findByEmailWithAccounts(String email);
}