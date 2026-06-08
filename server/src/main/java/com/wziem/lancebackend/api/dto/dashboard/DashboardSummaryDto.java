package com.wziem.lancebackend.api.dto.dashboard;

import java.math.BigDecimal;

public record DashboardSummaryDto(
        BigDecimal revenue,
        long activeProjects,
        long completedProjects,
        long tasksDueToday,
        long highPriorityDueToday,
        long clientCount
) {}
