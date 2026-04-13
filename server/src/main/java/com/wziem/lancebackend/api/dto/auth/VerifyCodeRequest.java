package com.wziem.lancebackend.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyCodeRequest(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{4,8}", message = "Code must be 4-8 digits") String code
) {
}

