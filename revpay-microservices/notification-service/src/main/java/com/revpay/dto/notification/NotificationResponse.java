package com.revpay.dto.notification;

import com.revpay.enums.NotificationType;
import java.time.Instant;

public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String body;
    private boolean read;
    private String actionUrl;
    private Long referenceId;
    private Instant createdAt;
    private Instant readAt;

    public Long getId()                      { return id; }
    public void setId(Long v)               { this.id = v; }
    public NotificationType getType()        { return type; }
    public void setType(NotificationType v)  { this.type = v; }
    public String getTitle()                 { return title; }
    public void setTitle(String v)           { this.title = v; }
    public String getBody()                  { return body; }
    public void setBody(String v)            { this.body = v; }
    public boolean isRead()                  { return read; }
    public void setRead(boolean v)           { this.read = v; }
    public String getActionUrl()             { return actionUrl; }
    public void setActionUrl(String v)       { this.actionUrl = v; }
    public Long getReferenceId()             { return referenceId; }
    public void setReferenceId(Long v)       { this.referenceId = v; }
    public Instant getCreatedAt()            { return createdAt; }
    public void setCreatedAt(Instant v)      { this.createdAt = v; }
    public Instant getReadAt()               { return readAt; }
    public void setReadAt(Instant v)         { this.readAt = v; }
}