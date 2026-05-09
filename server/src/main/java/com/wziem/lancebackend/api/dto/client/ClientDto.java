package com.wziem.lancebackend.api.dto.client;

import java.time.Instant;
import java.util.UUID;

public record ClientDto(
        UUID id,
        String name,
        String email,
        String companyName,
        String notes,
        Instant createdAt
) {}
