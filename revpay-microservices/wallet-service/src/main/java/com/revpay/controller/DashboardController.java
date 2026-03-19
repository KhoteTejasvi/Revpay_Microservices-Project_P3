package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.dashboard.DashboardResponse;
import com.revpay.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard data",
                dashboardService.getDashboard(email)));
    }
}