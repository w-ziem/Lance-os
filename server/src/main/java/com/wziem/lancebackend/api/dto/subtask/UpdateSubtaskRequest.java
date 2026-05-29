package com.wziem.lancebackend.api.dto.subtask;

import jakarta.validation.constraints.Size;

public record UpdateSubtaskRequest(
        @Size(max = 255) String label,
        Boolean done
) {}
