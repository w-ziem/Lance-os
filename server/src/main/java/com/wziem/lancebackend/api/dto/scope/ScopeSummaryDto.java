package com.wziem.lancebackend.api.dto.scope;

import java.math.BigDecimal;

/**
 * Read model behind the scope valuation panel. hourlyRate, totalValue, budget and
 * difference are null when the inputs they depend on are not set — the UI renders
 * a prompt in that case rather than a misleading zero.
 */
public record ScopeSummaryDto(
        int itemCount,
        double totalHours,
        Double hourlyRate,
        BigDecimal totalValue,
        BigDecimal budget,
        BigDecimal difference,
        boolean overBudget
) {}
