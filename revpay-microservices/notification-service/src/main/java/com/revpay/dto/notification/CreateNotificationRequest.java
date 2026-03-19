package com.revpay.dto.notification;

public class CreateNotificationRequest {
    private String userEmail;
    private String type;
    private String title;
    private String body;
    private String actionUrl;
    private Long referenceId;

    public CreateNotificationRequest() {}

    public CreateNotificationRequest(String userEmail, String type,
                                     String title, String body,
                                     String actionUrl, Long referenceId) {
        this.userEmail = userEmail;
        this.type = type;
        this.title = title;
        this.body = body;
        this.actionUrl = actionUrl;
        this.referenceId = referenceId;
    }

    public String getUserEmail()               { return userEmail; }
    public void setUserEmail(String v)         { this.userEmail = v; }
    public String getType()                    { return type; }
    public void setType(String v)              { this.type = v; }
    public String getTitle()                   { return title; }
    public void setTitle(String v)             { this.title = v; }
    public String getBody()                    { return body; }
    public void setBody(String v)              { this.body = v; }
    public String getActionUrl()               { return actionUrl; }
    public void setActionUrl(String v)         { this.actionUrl = v; }
    public Long getReferenceId()               { return referenceId; }
    public void setReferenceId(Long v)         { this.referenceId = v; }
}