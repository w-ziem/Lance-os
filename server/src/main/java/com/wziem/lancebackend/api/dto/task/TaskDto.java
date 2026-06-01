package com.wziem.lancebackend.api.dto.task;

import com.wziem.lancebackend.api.dto.subtask.SubtaskDto;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskDto(
        UUID id,
        UUID projectId,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate deadline,
        Double estimateHours,
        Instant scheduledStart,
        Instant scheduledEnd,
        boolean locked,
        List<SubtaskDto> subtasks,
        Instant createdAt,
        Instant updatedAt
) {}
