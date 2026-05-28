package com.wziem.lancebackend;

import com.wziem.lancebackend.api.dto.auth.RegisterRequest;
import com.wziem.lancebackend.api.dto.user.UserDto;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.config.auth.AuthCodeProperties;
import com.wziem.lancebackend.config.jwt.JwtService;
import com.wziem.lancebackend.exceptions.BadAuthenticationException;
import com.wziem.lancebackend.exceptions.UserAlreadyRegisteredException;
import com.wziem.lancebackend.exceptions.UserNotRegisteredException;
import com.wziem.lancebackend.model.entity.LoginCode;
import com.wziem.lancebackend.model.entity.User;
import com.wziem.lancebackend.model.repository.LoginCodeRepository;
import com.wziem.lancebackend.model.repository.UserRepository;
import com.wziem.lancebackend.service.AuthMailService;
import com.wziem.lancebackend.service.RefreshTokenCookieService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LoginCodeRepository loginCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthCodeProperties authCodeProperties;
    private final AuthMailService authMailService;
    private final JwtService jwtService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public User register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String fullName = normalizeFullName(request.fullName());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyRegisteredException("User with email " + normalizedEmail + " already exists.");
        }

        User user = userRepository.save(
                User.builder()
                        .email(normalizedEmail)
                        .fullName(fullName)
                        .build()
        );

        sendLoginEmail(normalizedEmail);

        return user;
    }

    @Transactional
    public void sendLoginEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UserNotRegisteredException("User with email " + normalizedEmail + " not found."));

        invalidateActiveCodes(user.getId());

        String loginCode = generateLoginCode();
        log.debug("Login code for {}: {}", normalizedEmail, loginCode);
        Instant now = Instant.now();
        LoginCode entity = LoginCode.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .codeHash(passwordEncoder.encode(loginCode))
                .createdAt(now)
                .expiresAt(now.plusSeconds(authCodeProperties.getTtlSeconds()))
                .build();
        loginCodeRepository.save(entity);

        authMailService.sendLoginCode(user.getEmail(), loginCode, authCodeProperties.getTtlSeconds());
    }

    @Transactional
    public String verifyLoginCode(String email, String code, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadAuthenticationException("Invalid email or verification code."));

        LoginCode loginCode = loginCodeRepository.findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new BadAuthenticationException("Invalid email or verification code."));

        if (loginCode.getExpiresAt().isBefore(Instant.now())) {
            throw new BadAuthenticationException("Verification code expired. Request a new code.");
        }
        if (!passwordEncoder.matches(code, loginCode.getCodeHash())) {
            throw new BadAuthenticationException("Invalid email or verification code.");
        }

        loginCode.setUsedAt(Instant.now());
        loginCodeRepository.save(loginCode);

        return issueTokens(user, response);
    }

    public String refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = refreshTokenCookieService.extractRefreshToken(request)
                .orElseThrow(() -> new BadAuthenticationException("Missing refresh token cookie."));

        String email;
        try {
            email = normalizeEmail(jwtService.getUserEmail(refreshToken));
        } catch (JwtException | IllegalArgumentException e) {
            throw new BadAuthenticationException("Invalid refresh token.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadAuthenticationException("Invalid refresh token."));
        if (!jwtService.isRefreshTokenValid(refreshToken, user)) {
            throw new BadAuthenticationException("Invalid refresh token.");
        }

        return issueTokens(user, response);
    }

    public void logout(HttpServletResponse response) {
        refreshTokenCookieService.clearRefreshTokenCookie(response);
    }

    public void issueRefreshTokenForOAuth2User(String email, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UserNotRegisteredException("User with email " + normalizedEmail + " not found."));

        String refreshToken = jwtService.generateRefreshToken(user);
        refreshTokenCookieService.setRefreshTokenCookie(response, refreshToken);
    }

    private String issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // CONFIG cookie flags and max-age are controlled in app.auth.refresh-cookie.*
        refreshTokenCookieService.setRefreshTokenCookie(response, refreshToken);
        return accessToken;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        return fullName.trim();
    }

    private void invalidateActiveCodes(UUID userId) {
        List<LoginCode> activeCodes = loginCodeRepository.findAllByUserIdAndUsedAtIsNull(userId);
        if (activeCodes.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        activeCodes.forEach(code -> code.setUsedAt(now));
        loginCodeRepository.saveAll(activeCodes);
    }

    private String generateLoginCode() {
        // CONFIG code length is controlled in app.auth.code.length
        int length = authCodeProperties.getLength();
        if (length < 4 || length > 8) {
            throw new IllegalStateException("Unsupported auth code length. Allowed range: 4-8.");
        }

        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        int generated = secureRandom.nextInt(max - min + 1) + min;
        return String.valueOf(generated);
    }

    public UserDto getMe() {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId()).orElseThrow(() -> new UsernameNotFoundException("User not logged in or user not found."));
        return new UserDto(user.getId(), user.getEmail(), user.getFullName());
    }
}
