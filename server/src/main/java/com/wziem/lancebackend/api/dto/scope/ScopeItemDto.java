package com.wziem.lancebackend.api.dto.scope;

import com.wziem.lancebackend.model.enums.ScopeItemSource;

import java.time.Instant;
import java.util.UUID;

public record ScopeItemDto(
        UUID id,
        UUID projectId,
        String name,
        String description,
        Double estimateHours,
        int position,
        ScopeItemSource source,
        Instant createdAt,
        Instant updatedAt
) {}
