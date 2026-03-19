package com.revpay.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class RevPayException extends RuntimeException {

    private final HttpStatus status;

    public RevPayException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    // ── Convenience factories ───────────────────────────────

    public static RevPayException notFound(String message) {
        return new RevPayException(message, HttpStatus.NOT_FOUND);
    }

    public static RevPayException badRequest(String message) {
        return new RevPayException(message, HttpStatus.BAD_REQUEST);
    }

    public static RevPayException conflict(String message) {
        return new RevPayException(message, HttpStatus.CONFLICT);
    }

    public static RevPayException forbidden(String message) {
        return new RevPayException(message, HttpStatus.FORBIDDEN);
    }

    public static RevPayException unauthorized(String message) {
        return new RevPayException(message, HttpStatus.UNAUTHORIZED);
    }
}