package com.wziem.lancebackend.api.dto.schedule;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ScheduleTaskRequest(
        @NotNull Instant startDate,
        @NotNull Instant endDate
) {}
