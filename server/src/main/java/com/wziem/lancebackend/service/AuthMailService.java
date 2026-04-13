package com.wziem.lancebackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthMailService {
    private final JavaMailSender mailSender;

    // CONFIG sender address comes from app.auth.mail.from
    @Value("${app.auth.mail.from}")
    private String fromAddress;

    // CONFIG email subject comes from app.auth.mail.subject
    @Value("${app.auth.mail.subject}")
    private String mailSubject;

    public void sendLoginCode(String recipient, String code, long ttlSeconds) {
        long ttlMinutes = Math.max(1, ttlSeconds / 60);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject(mailSubject);
        message.setText("""
                Your Lance verification code: %s

                This code expires in %d minute(s).
                If you did not request it, ignore this email.
                """.formatted(code, ttlMinutes));

        mailSender.send(message);
    }
}

