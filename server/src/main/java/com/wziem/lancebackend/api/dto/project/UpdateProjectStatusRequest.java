package com.wziem.lancebackend.api.dto.project;

import com.wziem.lancebackend.model.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProjectStatusRequest(
        @NotNull ProjectStatus status
) {}
