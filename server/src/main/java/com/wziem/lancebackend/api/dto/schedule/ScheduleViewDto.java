package com.wziem.lancebackend.api.dto.schedule;

import com.wziem.lancebackend.api.dto.task.TaskDto;

import java.util.List;

public record ScheduleViewDto(
        List<TaskDto> scheduled,
        List<TaskDto> unscheduled,
        ScheduleConfigDto config
) {}
