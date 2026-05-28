package com.wziem.lancebackend.api.dto.task;

import com.wziem.lancebackend.model.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
        @NotBlank @Size(max = 255) String title,
        @NotNull UUID projectId,
        String description,
        TaskPriority priority,
        LocalDate deadline,
        @Positive Double estimateHours
) {}
