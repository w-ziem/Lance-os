package com.wziem.lancebackend.api.dto.scope;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Partial update — null means "leave unchanged". */
public record UpdateScopeItemRequest(
        @Size(max = 255) String name,
        String description,
        @Positive Double estimateHours
) {}
