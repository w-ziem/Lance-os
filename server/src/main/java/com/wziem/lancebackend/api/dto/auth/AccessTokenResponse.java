package com.wziem.lancebackend.api.dto.auth;

public record AccessTokenResponse(
        String accessToken,
        String tokenType
) {
}

