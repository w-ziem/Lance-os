package com.wziem.lancebackend.api.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateProjectRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull UUID clientId,
        String description,
        LocalDate deadline
) {}
