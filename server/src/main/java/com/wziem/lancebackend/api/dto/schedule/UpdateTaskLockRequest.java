package com.wziem.lancebackend.api.dto.schedule;

import jakarta.validation.constraints.NotNull;

public record UpdateTaskLockRequest(
        @NotNull Boolean locked
) {}
