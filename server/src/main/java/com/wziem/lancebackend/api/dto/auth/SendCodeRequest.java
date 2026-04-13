package com.wziem.lancebackend.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendCodeRequest(
        @NotBlank @Email String email
) {
}

