package com.revpay.controller;

import com.revpay.common.ApiResponse;
import com.revpay.dto.notification.NotificationResponse;
import com.revpay.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Notifications",
                notificationService.getMyNotifications(email,
                        PageRequest.of(page, size,
                                Sort.by("createdAt").descending()))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Unread count",
                notificationService.getUnreadCount(email)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ApiResponse.ok("Marked as read",
                notificationService.markAsRead(email, id)));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.ok("All marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        notificationService.deleteNotification(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted"));
    }
}