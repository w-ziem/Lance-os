package com.wziem.lancebackend.api.dto.auth;

import java.util.UUID;

public record RegisterResponse(
        UUID id,
        String email,
        String fullName
) {
}

