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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenCookieService {

    // Two paths: /auth for direct access (Postman), /api/auth for frontend (Vite proxy strips /api).
    // A single cookie can only carry one Path, so we issue one cookie per path.
    private static final List<String> COOKIE_PATHS = List.of("/auth", "/api/auth");

    private final RefreshCookieProperties refreshCookieProperties;

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        for (String path : COOKIE_PATHS) {
            ResponseCookie cookie = ResponseCookie.from(refreshCookieProperties.getName(), refreshToken)
                    .httpOnly(true)
                    .secure(refreshCookieProperties.isSecure())
                    .path(path)
                    .sameSite(refreshCookieProperties.getSameSite())
                    .maxAge(Duration.ofSeconds(refreshCookieProperties.getMaxAgeSeconds()))
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        for (String path : COOKIE_PATHS) {
            ResponseCookie cookie = ResponseCookie.from(refreshCookieProperties.getName(), "")
                    .httpOnly(true)
                    .secure(refreshCookieProperties.isSecure())
                    .path(path)
                    .sameSite(refreshCookieProperties.getSameSite())
                    .maxAge(Duration.ZERO)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
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
