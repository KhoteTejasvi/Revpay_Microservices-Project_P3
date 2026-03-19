package com.revpay.service;

import com.revpay.common.RevPayException;
import com.revpay.dto.notification.CreateNotificationRequest;
import com.revpay.dto.notification.NotificationResponse;
import com.revpay.entity.Notification;
import com.revpay.enums.NotificationType;
import com.revpay.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Called internally by other services via Feign ────────

    @Transactional
    public void createNotification(CreateNotificationRequest req) {
        Notification n = new Notification();
        n.setUserEmail(req.getUserEmail());
        n.setType(NotificationType.valueOf(req.getType()));
        n.setTitle(req.getTitle());
        n.setBody(req.getBody());
        n.setActionUrl(req.getActionUrl());
        n.setReferenceId(req.getReferenceId());
        n.setRead(false);
        notificationRepository.save(n);
    }

    // ── User-facing ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(String email, Pageable pageable) {
        return notificationRepository
                .findByUserEmailOrderByCreatedAtDesc(email, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsRead(email, false);
    }

    @Transactional
    public NotificationResponse markAsRead(String email, Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Notification not found"));
        if (!n.getUserEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        n.setRead(true);
        n.setReadAt(Instant.now());
        return toResponse(notificationRepository.save(n));
    }

    @Transactional
    public void markAllAsRead(String email) {
        notificationRepository.markAllAsRead(email);
    }

    @Transactional
    public void deleteNotification(String email, Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> RevPayException.notFound("Notification not found"));
        if (!n.getUserEmail().equalsIgnoreCase(email)) {
            throw RevPayException.forbidden("Not authorized");
        }
        notificationRepository.delete(n);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType());
        r.setTitle(n.getTitle());
        r.setBody(n.getBody());
        r.setRead(n.isRead());
        r.setActionUrl(n.getActionUrl());
        r.setReferenceId(n.getReferenceId());
        r.setCreatedAt(n.getCreatedAt());
        r.setReadAt(n.getReadAt());
        return r;
    }
}