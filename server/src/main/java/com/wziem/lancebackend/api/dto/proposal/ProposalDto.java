package com.wziem.lancebackend.api.dto.proposal;

import com.fasterxml.jackson.databind.JsonNode;
import com.wziem.lancebackend.model.enums.IngestChannel;
import com.wziem.lancebackend.model.enums.ProposalKind;
import com.wziem.lancebackend.model.enums.ProposalStatus;

import java.time.Instant;
import java.util.UUID;

public record ProposalDto(
        UUID id,
        UUID targetProjectId,
        ProposalKind kind,
        ProposalStatus status,
        IngestChannel sourceChannel,
        String sourceText,
        JsonNode payload,
        String summary,
        Instant createdAt,
        Instant decidedAt
) {}
