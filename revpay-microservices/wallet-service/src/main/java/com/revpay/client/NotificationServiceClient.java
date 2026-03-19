package com.revpay.client;

import com.revpay.dto.notification.CreateNotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/internal/create")
    void createNotification(@RequestBody CreateNotificationRequest request);
}