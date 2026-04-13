package com.wziem.lancebackend.config;

import com.wziem.lancebackend.exceptions.BadAuthenticationException;
import com.wziem.lancebackend.exceptions.UserAlreadyRegisteredException;
import com.wziem.lancebackend.exceptions.UserNotRegisteredException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadAuthenticationException.class)
    public ResponseEntity<String> handleBadAuthenticationException(BadAuthenticationException e) {
        return ResponseEntity.status(401).body(e.getMessage());
    }

    @ExceptionHandler(UserNotRegisteredException.class)
    public ResponseEntity<String> handleUserNotRegisteredException(UserNotRegisteredException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @ExceptionHandler(UserAlreadyRegisteredException.class)
    public ResponseEntity<String> handleUserAlreadyRegisteredException(UserAlreadyRegisteredException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity.status(400).body(message);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.status(400).body(e.getMessage());
    }
}
