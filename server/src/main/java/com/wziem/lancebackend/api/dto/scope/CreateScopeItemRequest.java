package com.wziem.lancebackend.api.dto.scope;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateScopeItemRequest(
        @NotBlank @Size(max = 255) String name,
        String description,
        @NotNull @Positive Double estimateHours
) {}
