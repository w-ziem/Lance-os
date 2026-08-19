package com.wziem.lancebackend.api.dto.user;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateHourlyRateRequest(
        @NotNull @PositiveOrZero Double hourlyRate
) {}
