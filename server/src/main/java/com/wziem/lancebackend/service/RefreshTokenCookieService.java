package com.wziem.lancebackend.service;

import com.wziem.lancebackend.config.auth.RefreshCookieProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenCookieService {
    private final RefreshCookieProperties refreshCookieProperties;

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        // CONFIG refresh token cookie policy comes from app.auth.refresh-cookie.*
        ResponseCookie cookie = ResponseCookie.from(refreshCookieProperties.getName(), refreshToken)
                .httpOnly(true)
                .secure(refreshCookieProperties.isSecure())
                .path(refreshCookieProperties.getPath())
                .sameSite(refreshCookieProperties.getSameSite())
                .maxAge(Duration.ofSeconds(refreshCookieProperties.getMaxAgeSeconds()))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(refreshCookieProperties.getName(), "")
                .httpOnly(true)
                .secure(refreshCookieProperties.isSecure())
                .path(refreshCookieProperties.getPath())
                .sameSite(refreshCookieProperties.getSameSite())
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Optional<String> extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> refreshCookieProperties.getName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}

