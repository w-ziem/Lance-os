package com.wziem.lancebackend.api.dto.subtask;

import java.util.UUID;

public record SubtaskDto(
        UUID id,
        String label,
        boolean done,
        int position
) {}
