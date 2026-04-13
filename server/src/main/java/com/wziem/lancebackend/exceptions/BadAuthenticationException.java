package com.wziem.lancebackend.exceptions;

public class BadAuthenticationException extends RuntimeException {
    public BadAuthenticationException(String message) {
        super(message);
    }
}
