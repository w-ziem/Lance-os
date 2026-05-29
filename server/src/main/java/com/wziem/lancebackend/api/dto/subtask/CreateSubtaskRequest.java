package com.wziem.lancebackend.api.dto.subtask;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSubtaskRequest(
        @NotBlank @Size(max = 255) String label
) {}
