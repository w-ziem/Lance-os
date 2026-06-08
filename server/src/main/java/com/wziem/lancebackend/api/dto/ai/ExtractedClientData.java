package com.wziem.lancebackend.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ExtractedClientData(
        ExtractedClient client,
        ExtractedProject project,
        List<ExtractedTask> tasks
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ExtractedClient(
            String name,
            String email,
            String companyName,
            String phone,
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ExtractedProject(
            String name,
            String description,
            String deadline,
            Double budget
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ExtractedTask(
            String title,
            String description,
            String priority
    ) {}
}
