package com.revpay.controller;

import com.revpay.dto.notification.CreateNotificationRequest;
import com.revpay.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/internal")
@RequiredArgsConstructor
public class NotificationInternalController {

    private final NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<Void> create(
            @RequestBody CreateNotificationRequest request) {
        notificationService.createNotification(request);
        return ResponseEntity.ok().build();
    }
}