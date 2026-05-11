package com.wziem.lancebackend.api.dto.project;

import com.wziem.lancebackend.model.enums.ProjectStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectDto(
        UUID id,
        UUID clientId,
        String name,
        String description,
        ProjectStatus status,
        LocalDate deadline,
        Instant createdAt,
        Instant updatedAt
) {}
