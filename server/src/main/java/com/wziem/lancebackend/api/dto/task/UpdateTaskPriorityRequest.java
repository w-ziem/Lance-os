package com.wziem.lancebackend.api.dto.task;

import com.wziem.lancebackend.model.enums.TaskPriority;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskPriorityRequest(
        @NotNull TaskPriority priority
) {}
