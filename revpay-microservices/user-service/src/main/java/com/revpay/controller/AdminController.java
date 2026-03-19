package com.revpay.controller;

import com.revpay.client.LoanServiceClient;
import com.revpay.common.ApiResponse;
import com.revpay.dto.admin.AdminUserResponse;
import com.revpay.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final LoanServiceClient loanServiceClient;
    public AdminController(AdminService adminService, LoanServiceClient loanServiceClient) {
        this.adminService = adminService;
        this.loanServiceClient = loanServiceClient;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Users",
                adminService.getAllUsers(
                        PageRequest.of(page, size,
                                Sort.by("createdAt").descending()))));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User",
                adminService.getUserById(id)));
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                adminService.toggleUserStatus(id)));
    }

    // Stats — user counts only (loan pending count comes from loan-service)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",     adminService.getTotalUsers());
        stats.put("personalUsers",  adminService.getTotalByRole("PERSONAL"));
        stats.put("businessUsers",  adminService.getTotalByRole("BUSINESS"));

        // Get pending loans from loan-service safely
        try {
            Map<String, Object> loanStats = loanServiceClient.getLoanStats();
            stats.put("pendingLoans", loanStats.getOrDefault("pendingLoans", 0));
        } catch (Exception e) {
            stats.put("pendingLoans", 0);
        }

        return ResponseEntity.ok(ApiResponse.ok("Stats", stats));
    }
}