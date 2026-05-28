package com.wziem.lancebackend.api.dto.task;

import com.wziem.lancebackend.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(
        @NotNull TaskStatus status
) {}
