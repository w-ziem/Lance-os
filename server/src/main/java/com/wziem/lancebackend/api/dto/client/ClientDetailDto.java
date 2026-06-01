package com.wziem.lancebackend.api.dto.client;

import java.time.Instant;
import java.util.UUID;

public record ClientDetailDto(
        UUID id,
        String name,
        String email,
        String companyName,
        String phone,
        String notes,
        Instant createdAt,
        long activeProjects,
        long completedProjects
) {}
