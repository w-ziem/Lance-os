package com.wziem.lancebackend.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wziem.lancebackend.UserService;
import com.wziem.lancebackend.api.dto.auth.AccessTokenResponse;
import com.wziem.lancebackend.api.dto.auth.RegisterRequest;
import com.wziem.lancebackend.api.dto.auth.RegisterResponse;
import com.wziem.lancebackend.api.dto.auth.SendCodeRequest;
import com.wziem.lancebackend.api.dto.auth.VerifyCodeRequest;
import com.wziem.lancebackend.api.dto.user.UpdateHourlyRateRequest;
import com.wziem.lancebackend.api.dto.user.UserDto;
import com.wziem.lancebackend.model.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        RegisterResponse response = new RegisterResponse(user.getId(), user.getEmail(), user.getFullName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping({"/send-code", "/login-request"})
    public ResponseEntity<Void> sendLoginEmail(@Valid @RequestBody SendCodeRequest request) {
        userService.sendLoginEmail(request.email());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<AccessTokenResponse> verifyLoginCode(
            @Valid @RequestBody VerifyCodeRequest request,
            HttpServletResponse response
    ) {
        String accessToken = userService.verifyLoginCode(request.email(), request.code(), response);
        return ResponseEntity.status(HttpStatus.OK).body(new AccessTokenResponse(accessToken, "Bearer"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = userService.refreshAccessToken(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(new AccessTokenResponse(accessToken, "Bearer"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        userService.logout(response);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        UserDto user = userService.getMe();
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @PatchMapping("/me/hourly-rate")
    public ResponseEntity<UserDto> updateHourlyRate(@Valid @RequestBody UpdateHourlyRateRequest request) {
        return ResponseEntity.ok(userService.updateHourlyRate(request));
    }
}
