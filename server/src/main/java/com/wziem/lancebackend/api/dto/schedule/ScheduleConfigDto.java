package com.wziem.lancebackend.api.dto.schedule;

public record ScheduleConfigDto(
        int workStartHour,
        int workEndHour,
        int slotMinutes
) {}
